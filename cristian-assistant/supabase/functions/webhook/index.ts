import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { HumanMessage } from "@langchain/core/messages";
import { jsonResponse, errorResponse, corsResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { sendWhatsAppText } from "../_shared/evolution.ts";
import { isLangChainAvailable } from "../_shared/langchain/config.ts";
import { trabajoAgent } from "../_shared/langchain/agent.ts";
import { detectIntent } from "../_shared/langchain/intent.ts";
import { chat } from "../_shared/langchain/chat.ts";
import { prepareImageForAgent } from "../_shared/langchain/multimedia.ts";
import { extractContent } from "../_shared/langchain/extract-content.ts";

const AGENT_RECURSION_LIMIT = 15;

function extractMessageText(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = (
    body as {
      data?: { text?: { body?: string }; message?: { conversation?: string } };
    }
  ).data;
  if (!data) return null;
  const text = data.text?.body ?? data.message?.conversation ?? null;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

function extractSenderNumber(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = (
    body as { data?: { key?: { remoteJid?: string }; from?: string } }
  ).data;
  if (!data) return null;
  const jid = data.key?.remoteJid ?? data.from ?? null;
  if (typeof jid !== "string") return null;
  const num = jid.split("@")[0]?.replace(/\D/g, "");
  return num && num.length >= 10 ? num : null;
}

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

const CHAT_SYSTEM =
  "Eres el Assistant Cristian Alancay (soluciones de video y seguridad). Responde de forma breve y amigable en español.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  try {
    const body = await req.json();
    const messageText = extractMessageText(body);
    const imageRaw = extractImageFromPayload(body);
    const senderNumber = extractSenderNumber(body);

    const response: { received: boolean; intent?: unknown; agent?: boolean } = {
      received: true,
    };

    const hasInput = (messageText?.trim()?.length ?? 0) > 0 || imageRaw;

    if (hasInput && senderNumber && isLangChainAvailable()) {
      try {
        let reply = "";
        const imageDataUrl = imageRaw
          ? await prepareImageForAgent(imageRaw)
          : null;

        try {
          const content: Array<
            | { type: "text"; text: string }
            | { type: "image_url"; image_url: { url: string } }
          > = [];
          const text = messageText?.trim() || "¿Qué hay en esta imagen?";
          content.push({ type: "text", text });
          if (imageDataUrl) {
            content.push({
              type: "image_url",
              image_url: { url: imageDataUrl },
            });
          }
          const messages = [new HumanMessage({ content })];
          const result = await trabajoAgent.invoke(
            { messages },
            { recursionLimit: AGENT_RECURSION_LIMIT }
          );
          reply = extractContent(
            ((result as { messages?: unknown[] }).messages ?? []).at(-1)
          );
          response.agent = true;
        } catch (agentErr) {
          console.error("[webhook] Agent error, fallback:", agentErr);
        }

        if (!reply && messageText) {
          const intent = await detectIntent(messageText);
          response.intent = intent;

          if (
            intent.intent === "crear_lead" &&
            intent.confianza >= 0.7 &&
            intent.datos_extraidos
          ) {
            const d = intent.datos_extraidos;
            const nombre =
              d.nombre ?? d.nombre_completo ?? "Contacto WhatsApp";
            const email =
              d.email ??
              (senderNumber
                ? `whatsapp-${senderNumber}@trabajo.temp`
                : null);
            const telefono = d.telefono ?? senderNumber ?? undefined;

            if (email) {
              const supabase = createServiceClient();
              await supabase.from("leads").insert({
                nombre,
                email,
                telefono: telefono ?? null,
                empresa: d.empresa ?? null,
                canal_origen: "whatsapp",
                estado: "prospecto",
                necesidad: intent.resumen || null,
                notas: `WhatsApp: ${senderNumber ?? "?"}`,
              });
              reply =
                "¡Perfecto! Registré tus datos. Un asesor de Assistant Cristian Alancay te contactará pronto. ¿Necesitas algo más?";
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
        console.error("[webhook] Error:", err);
      }
    }

    return jsonResponse(response);
  } catch {
    return errorResponse("Invalid payload", 400);
  }
});
