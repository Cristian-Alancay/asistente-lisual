import { tool } from "langchain";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { getVisionModel } from "../config";
import { HumanMessage } from "@langchain/core/messages";

function getSupabase() {
  try {
    return createServiceClient();
  } catch {
    return null;
  }
}

/**
 * Lista leads recientes con filtro opcional por estado.
 */
export const listLeads = tool(
  async ({ estado, limit }) => {
    const supabase = getSupabase();
    if (!supabase) return "Error: SUPABASE_SERVICE_ROLE_KEY no configurada. No puedo acceder a la base de datos.";
    let q = supabase
      .from("leads")
      .select("id, nombre, empresa, email, telefono, estado, canal_origen, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (estado) q = q.eq("estado", estado);
    const { data, error } = await q;
    if (error) return `Error al listar leads: ${error.message}`;
    return JSON.stringify(data ?? [], null, 2);
  },
  {
    name: "list_leads",
    description: "Lista los leads (prospectos) del sistema. Usa cuando pregunten por contactos, prospectos o quién ha consultado.",
    schema: z.object({
      estado: z.enum(["prospecto", "negociacion", "convertido", "perdido"]).optional().describe("Filtrar por estado del lead"),
      limit: z.number().min(1).max(50).default(10).describe("Cantidad máxima de resultados"),
    }),
  }
);

/**
 * Crea un nuevo lead en el sistema.
 */
export const createLead = tool(
  async ({ nombre, email, telefono, empresa, canal_origen, necesidad }) => {
    const supabase = getSupabase();
    if (!supabase) return "Error: SUPABASE_SERVICE_ROLE_KEY no configurada.";
    const { data, error } = await supabase
      .from("leads")
      .insert({
        nombre,
        email,
        telefono: telefono ?? null,
        empresa: empresa ?? null,
        canal_origen: canal_origen ?? "manual",
        necesidad: necesidad ?? null,
      })
      .select("id, nombre, email, created_at")
      .single();
    if (error) return `Error al crear lead: ${error.message}`;
    return `Lead creado: ${data.nombre} (${data.email}), id: ${data.id}`;
  },
  {
    name: "create_lead",
    description: "Crea un nuevo lead (prospecto) con nombre, email y opcionalmente teléfono, empresa y necesidad. Usar cuando el usuario quiera registrarse o dejar datos para contacto.",
    schema: z.object({
      nombre: z.string().describe("Nombre del contacto"),
      email: z.string().email().describe("Email"),
      telefono: z.string().optional().describe("Teléfono"),
      empresa: z.string().optional().describe("Empresa u organización"),
      canal_origen: z.enum(["manual", "web", "whatsapp", "reunion", "referencia"]).optional().default("manual"),
      necesidad: z.string().optional().describe("Descripción de la necesidad o consulta"),
    }),
  }
);

/**
 * Busca leads por nombre, empresa o email (parcial, insensible a mayúsculas).
 */
export const searchLeads = tool(
  async ({ query, limit }) => {
    const supabase = getSupabase();
    if (!supabase) return "Error: SUPABASE_SERVICE_ROLE_KEY no configurada.";
    const sanitized = String(query).replace(/%|_/g, "").trim();
    if (!sanitized) return "Indica el texto a buscar (nombre, empresa o email).";
    const pattern = `%${sanitized}%`;
    const { data, error } = await supabase
      .from("leads")
      .select("id, nombre, empresa, email, telefono, estado, created_at")
      .or(`nombre.ilike.${pattern},empresa.ilike.${pattern},email.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (error) return `Error: ${error.message}`;
    return JSON.stringify(data ?? [], null, 2);
  },
  {
    name: "search_leads",
    description: "Busca leads por nombre, empresa o email (parcial). Usar cuando el usuario pregunte por un contacto por nombre o no sepa el ID.",
    schema: z.object({
      query: z.string().min(1).describe("Texto a buscar en nombre, empresa o email"),
      limit: z.number().min(1).max(20).default(10).describe("Cantidad máxima de resultados"),
    }),
  }
);

/**
 * Busca un lead por ID o por email. Debe indicarse al menos uno.
 */
export const getLead = tool(
  async ({ id, email }) => {
    const supabase = getSupabase();
    if (!supabase) return "Error: SUPABASE_SERVICE_ROLE_KEY no configurada.";
    if (id) {
      const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
      if (error) return `Error: ${error.message}`;
      return JSON.stringify(data, null, 2);
    }
    if (email) {
      const { data, error } = await supabase.from("leads").select("*").eq("email", email).maybeSingle();
      if (error) return `Error: ${error.message}`;
      return data ? JSON.stringify(data, null, 2) : "No se encontró lead con ese email.";
    }
    return "Indica id o email del lead.";
  },
  {
    name: "get_lead",
    description: "Obtiene el detalle completo de un lead. Debes indicar el id (UUID) del lead O su email. Usar cuando ya tengas el id o email del contacto.",
    schema: z.object({
      id: z.string().uuid().optional().describe("ID (UUID) del lead"),
      email: z.string().email().optional().describe("Email del lead"),
    }),
  }
);

/**
 * Lista presupuestos de un lead o los últimos presupuestos.
 */
export const listPresupuestos = tool(
  async ({ lead_id, limit }) => {
    const supabase = getSupabase();
    if (!supabase) return "Error: SUPABASE_SERVICE_ROLE_KEY no configurada.";
    let q = supabase
      .from("presupuestos")
      .select("id, numero, lead_id, total, moneda, estado, fecha_emision, vigencia_hasta")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (lead_id) q = q.eq("lead_id", lead_id);
    const { data, error } = await q;
    if (error) return `Error: ${error.message}`;
    return JSON.stringify(data ?? [], null, 2);
  },
  {
    name: "list_presupuestos",
    description: "Lista presupuestos. Opcionalmente filtra por lead_id. Usar cuando pregunten por cotizaciones o presupuestos.",
    schema: z.object({
      lead_id: z.string().uuid().optional().describe("ID del lead para filtrar presupuestos"),
      limit: z.number().min(1).max(30).default(10),
    }),
  }
);

/**
 * OCR / extracción de texto desde una imagen (base64).
 * Usa el modelo de visión para leer todo el texto visible en la imagen.
 */
export const ocrImage = tool(
  async ({ image_base64, instruction }) => {
    try {
      const vision = getVisionModel();
      const prompt = instruction?.trim()
        ? instruction
        : "Extrae todo el texto que veas en esta imagen (OCR). Responde únicamente con el texto extraído, sin explicaciones.";
      const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
        { type: "text", text: prompt },
        {
          type: "image_url",
          image_url: {
            url: image_base64.startsWith("data:") ? image_base64 : `data:image/jpeg;base64,${image_base64}`,
          },
        },
      ];
      const msg = new HumanMessage({ content });
      const response = await vision.invoke([msg]);
      const text = response.content;
      return typeof text === "string" ? text : String(text ?? "");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return `Error en OCR: ${message}`;
    }
  },
  {
    name: "ocr_image",
    description: "Extrae el texto de una imagen (OCR). Recibe la imagen en base64. Usar cuando el usuario envíe una foto de un documento, factura, captura de pantalla o cualquier imagen con texto que deba leerse.",
    schema: z.object({
      image_base64: z.string().describe("Imagen en base64 (con o sin prefijo data:image/...)"),
      instruction: z.string().optional().describe("Instrucción opcional: qué extraer o cómo interpretar la imagen"),
    }),
  }
);

/**
 * Analiza una imagen y describe su contenido (objetos, texto, contexto).
 * Útil para capturas de pantalla, fotos de instalaciones, etc.
 */
export const analyzeImage = tool(
  async ({ image_base64, question }) => {
    try {
      const vision = getVisionModel();
      const prompt = question?.trim() ?? "Describe qué ves en esta imagen: objetos, texto visible, contexto y cualquier dato relevante.";
      const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
        { type: "text", text: prompt },
        {
          type: "image_url",
          image_url: {
            url: image_base64.startsWith("data:") ? image_base64 : `data:image/jpeg;base64,${image_base64}`,
          },
        },
      ];
      const msg = new HumanMessage({ content });
      const response = await vision.invoke([msg]);
      const text = response.content;
      return typeof text === "string" ? text : String(text ?? "");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return `Error al analizar imagen: ${message}`;
    }
  },
  {
    name: "analyze_image",
    description: "Analiza una imagen y describe su contenido o responde una pregunta sobre ella. Usar para capturas de pantalla, fotos de instalaciones, documentos o cualquier imagen que el usuario quiera interpretar.",
    schema: z.object({
      image_base64: z.string().describe("Imagen en base64"),
      question: z.string().optional().describe("Pregunta concreta sobre la imagen (opcional)"),
    }),
  }
);

export const trabajoTools = [
  listLeads,
  searchLeads,
  createLead,
  getLead,
  listPresupuestos,
  ocrImage,
  analyzeImage,
];
