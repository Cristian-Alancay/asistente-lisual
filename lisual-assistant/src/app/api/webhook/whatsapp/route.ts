import {
  isLangChainAvailable,
  lisualAgent,
  detectIntent,
  chat,
  prepareImageForAgent,
} from "@/lib/langchain";
import { createLead } from "@/lib/actions/leads";
import { sendWhatsAppText } from "@/lib/evolution";
import { HumanMessage } from "@langchain/core/messages";
import { NextRequest, NextResponse } from "next/server";
import type { LeadFormData } from "@/lib/validations/lead";

const AGENT_RECURSION_LIMIT = 15;

export const maxDuration = 50;

function extractMessageText(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = (body as { data?: { text?: { body?: string }; message?: { conversation?: string } } })
    .data;
  if (!data) return null;
  const text = data.text?.body ?? data.message?.conversation ?? null;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

function extractSenderNumber(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = (body as { data?: { key?: { remoteJid?: string }; from?: string } }).data;
  if (!data) return null;
  const jid = data.key?.remoteJid ?? data.from ?? null;
  if (typeof jid !== "string") return null;
  const num = jid.split("@")[0]?.replace(/\D/g, "");
  return num && num.length >= 10 ? num : null;
}

/**
 * Extrae imagen del payload: base64 (Evolution con webhook_base64: true) o URL (Evolution sin base64).
 * Rutas típicas: data.image.base64, data.message.imageMessage.base64/url, data.message.image.base64.
 */
function extractImageFromPayload(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = (body as { data?: Record<string, unknown> }).data;
  if (!data) return null;
  const msg = data.message as Record<string, unknown> | undefined;
  const imageMsg = (msg?.imageMessage ?? msg?.image ?? data.image) as
    | { base64?: string; url?: string }
    | undefined;
  const raw =
    imageMsg?.base64 ??
    imageMsg?.url ??
    (data.image as { base64?: string } | undefined)?.base64 ??
    (data as { imageBase64?: string }).imageBase64;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

function extractAgentContent(result: { messages?: unknown[] }): string {
  const messages = result.messages ?? [];
  const last = messages[messages.length - 1];
  if (!last || typeof last !== "object") return "";
  const c = (last as { content?: unknown }).content;
  if (typeof c === "string") return c;
  if (Array.isArray(c))
    return (c as { type?: string; text?: string }[])
      .filter((b) => b?.type === "text" && typeof b.text === "string")
      .map((b) => (b as { text: string }).text)
      .join("");
  return "";
}

const CHAT_SYSTEM =
  "Eres el asistente de Lisual (soluciones de video y seguridad). Responde de forma breve y amigable en español.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messageText = extractMessageText(body);
    const imageRaw = extractImageFromPayload(body);
    const senderNumber = extractSenderNumber(body);

    const response: { received: boolean; intent?: unknown; agent?: boolean } = { received: true };

    const hasInput = (messageText?.trim()?.length ?? 0) > 0 || imageRaw;

    if (hasInput && senderNumber && isLangChainAvailable()) {
      try {
        let reply = "";

        // Preparar imagen en backend (base64 o URL → data URL para el modelo)
        const imageDataUrl = imageRaw ? await prepareImageForAgent(imageRaw) : null;

        // Flujo principal: agente completo (tools + visión)
        try {
          const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];
          const text = messageText?.trim() || "¿Qué hay en esta imagen?";
          content.push({ type: "text", text });
          if (imageDataUrl) {
            content.push({ type: "image_url", image_url: { url: imageDataUrl } });
          }
          const messages = [new HumanMessage({ content })];

          const result = await lisualAgent.invoke(
            { messages },
            { recursionLimit: AGENT_RECURSION_LIMIT }
          );
          reply = extractAgentContent(result as { messages?: unknown[] });
          response.agent = true;
        } catch (agentErr) {
          console.error("[webhook/whatsapp] Agent error, fallback to intent+chat:", agentErr);
        }

        // Fallback: solo texto → intent + chat (crear lead o respuesta corta)
        if (!reply && messageText) {
          const intent = await detectIntent(messageText);
          response.intent = intent;

          if (intent.intent === "crear_lead" && intent.confianza >= 0.7 && intent.datos_extraidos) {
            const d = intent.datos_extraidos;
            const nombre = d.nombre ?? d.nombre_completo ?? "Contacto WhatsApp";
            const email = d.email ?? (senderNumber ? `whatsapp-${senderNumber}@lisual.temp` : null);
            const telefono = d.telefono ?? senderNumber ?? undefined;

            if (email) {
              const form: LeadFormData = {
                nombre,
                email,
                telefono,
                empresa: d.empresa ?? undefined,
                canal_origen: "whatsapp",
                estado: "prospecto",
                presupuesto_estimado: undefined,
                necesidad: intent.resumen || undefined,
                fecha_decision_estimada: undefined,
                notas: `WhatsApp: ${senderNumber ?? "?"}`,
              };
              await createLead(form);
              reply =
                "¡Perfecto! Registré tus datos. Un asesor de Lisual te contactará pronto. ¿Necesitas algo más?";
            } else {
              reply =
                "Para registrarte necesito tu email. ¿Podés enviármelo? También tu nombre si querés.";
            }
          }

          if (!reply) {
            reply = await chat({
              userMessage: messageText,
              systemMessage: CHAT_SYSTEM,
            });
          }
        }

        if (reply && senderNumber) {
          await sendWhatsAppText(senderNumber, reply);
        }
      } catch (err) {
        console.error("[webhook/whatsapp] Error:", err);
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
