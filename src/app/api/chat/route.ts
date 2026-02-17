import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type ModelMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createLead } from "@/lib/actions/leads";
import { saveChatMessage } from "@/lib/actions/chat";
import type { LeadFormData } from "@/lib/validations/lead";

function extractTextFromMessage(msg: { content?: unknown }): string {
  const c = msg.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) {
    return c
      .map((p) => (p && typeof p === "object" && "text" in p ? String((p as { text: string }).text) : ""))
      .filter(Boolean)
      .join("");
  }
  return "";
}

function extractTextFromUIMessage(msg: { parts?: Array<{ type?: string; text?: string }> }): string {
  const parts = msg.parts ?? [];
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text as string)
    .join("");
}

const SYSTEM_PROMPT = `Eres el asistente de Lisual, una empresa de soluciones de video y seguridad. Ayudas con:
- Ventas: leads, presupuestos, clientes
- Operaciones: proyectos, instalaciones
- Experiencia al cliente: solicitudes de video, revisiones, referencias

Responde en español, de forma concisa y profesional. Usa las herramientas disponibles cuando el usuario pida crear un lead, consultar presupuestos, ver estado o listar leads.`;

export const maxDuration = 30;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY no configurada." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: ModelMessage[];
  try {
    const body = await req.json();
    const rawMessages = body?.messages;
    if (Array.isArray(rawMessages) && rawMessages.length > 0) {
      messages = (await convertToModelMessages(rawMessages)) as ModelMessage[];
    } else {
      const text = typeof body?.message === "string" ? body.message?.trim() : "";
      if (!text) {
        return new Response(
          JSON.stringify({ error: "Campo 'messages' o 'message' requerido." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      messages = [{ role: "user", content: text }];
    }
  } catch {
    return new Response(
      JSON.stringify({ error: "Body JSON inválido." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const lastUser = messages.filter((m) => m.role === "user").pop();
    if (lastUser) {
      const text = extractTextFromMessage(lastUser);
      if (text.trim()) await saveChatMessage("user", text);
    }
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages,
    stopWhen: stepCountIs(5),
    tools: {
      crear_lead: tool({
        description:
          "Crear un nuevo lead con nombre, email y opcionalmente teléfono y empresa. Úsalo cuando el usuario quiera registrarse, dejar datos para contacto o ser prospecto.",
        inputSchema: z.object({
          nombre: z.string().describe("Nombre completo del lead"),
          email: z.string().email().describe("Email del lead"),
          telefono: z.string().optional().describe("Teléfono del lead"),
          empresa: z.string().optional().describe("Empresa u organización"),
        }),
        execute: async ({ nombre, email, telefono, empresa }) => {
          const form: LeadFormData = {
            nombre,
            email,
            telefono: telefono ?? undefined,
            empresa: empresa ?? undefined,
            canal_origen: "web",
            estado: "prospecto",
            presupuesto_estimado: undefined,
            necesidad: undefined,
            fecha_decision_estimada: undefined,
            notas: undefined,
          };
          await createLead(form);
          return `Lead creado correctamente: ${nombre} (${email})`;
        },
      }),
      consultar_presupuestos: tool({
        description:
          "Consultar presupuestos de un lead por su ID. Necesitas el lead_id (UUID) del lead.",
        inputSchema: z.object({
          lead_id: z.string().uuid().describe("ID del lead"),
        }),
        execute: async ({ lead_id }) => {
          const { data, error } = await supabase
            .from("presupuestos")
            .select("id, numero, estado, total, moneda, vigencia_hasta, fecha_emision")
            .eq("lead_id", lead_id)
            .order("created_at", { ascending: false });
          if (error) return `Error: ${error.message}`;
          if (!data?.length) return "No hay presupuestos para ese lead.";
          return JSON.stringify(data, null, 2);
        },
      }),
      consultar_estado: tool({
        description:
          "Consultar estado de un lead y sus presupuestos. Necesitas el lead_id (UUID).",
        inputSchema: z.object({
          lead_id: z.string().uuid().describe("ID del lead"),
        }),
        execute: async ({ lead_id }) => {
          const { data: lead, error: leadErr } = await supabase
            .from("leads")
            .select("id, nombre, estado, email, telefono")
            .eq("id", lead_id)
            .single();
          if (leadErr || !lead) return `Error o lead no encontrado: ${leadErr?.message ?? "no existe"}`;

          const { data: pres } = await supabase
            .from("presupuestos")
            .select("numero, estado, total")
            .eq("lead_id", lead_id);

          const presStr = pres?.length
            ? pres.map((p) => `${p.numero}: ${p.estado} - $${p.total}`).join("; ")
            : "Sin presupuestos";
          return `Lead: ${lead.nombre} (${lead.estado}). Presupuestos: ${presStr}`;
        },
      }),
      listar_leads: tool({
        description:
          "Listar leads con filtros opcionales. Útil para buscar por estado o nombre.",
        inputSchema: z.object({
          estado: z
            .enum(["prospecto", "negociacion", "convertido", "perdido"])
            .optional()
            .describe("Filtrar por estado"),
          limite: z.number().min(1).max(20).optional().default(10),
        }),
        execute: async ({ estado, limite }) => {
          let q = supabase
            .from("leads")
            .select("id, nombre, email, estado, empresa")
            .order("created_at", { ascending: false })
            .limit(limite ?? 10);
          if (estado) q = q.eq("estado", estado);
          const { data, error } = await q;
          if (error) return `Error: ${error.message}`;
          if (!data?.length) return "No hay leads que coincidan.";
          return JSON.stringify(
            data.map((l) => ({ id: l.id, nombre: l.nombre, email: l.email, estado: l.estado })),
            null,
            2
          );
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    onFinish: async ({ responseMessage, isAborted }) => {
      if (isAborted || !user) return;
      const text = extractTextFromUIMessage(responseMessage as { parts?: Array<{ type?: string; text?: string }> });
      if (text.trim()) await saveChatMessage("assistant", text);
    },
  });
}
