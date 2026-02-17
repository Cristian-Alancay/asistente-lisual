import { isLangChainAvailable, detectIntent, chat } from "@/lib/langchain";
import { createLead } from "@/lib/actions/leads";
import { sendWhatsAppText } from "@/lib/evolution";
import { NextRequest, NextResponse } from "next/server";
import type { LeadFormData } from "@/lib/validations/lead";

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
  // remoteJid format: "5491112345678@s.whatsapp.net"
  const num = jid.split("@")[0]?.replace(/\D/g, "");
  return num && num.length >= 10 ? num : null;
}

const CHAT_SYSTEM =
  "Eres el asistente de Lisual (soluciones de video y seguridad). Responde de forma breve y amigable en español. Si el usuario quiere información de servicios, presupuestos o dejar datos, indícale que puede hacerlo y cómo.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messageText = extractMessageText(body);
    const senderNumber = extractSenderNumber(body);

    const response: { received: boolean; intent?: unknown } = { received: true };

    if (messageText && isLangChainAvailable()) {
      try {
        const intent = await detectIntent(messageText);
        response.intent = intent;

        let reply = "";

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
