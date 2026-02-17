import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { isLangChainAvailable, prepareImageForAgent } from "@/lib/langchain";
import { lisualAgent } from "@/lib/langchain/agent";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type MessageRole = "user" | "assistant";

/** imageDataUrl: ya normalizada por prepareImageForAgent (data:image/...;base64,...). */
function buildMessages(
  messages: { role: MessageRole; content: string }[],
  imageDataUrl?: string | null
): (InstanceType<typeof HumanMessage> | InstanceType<typeof AIMessage>)[] {
  const out: (InstanceType<typeof HumanMessage> | InstanceType<typeof AIMessage>)[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "assistant") {
      out.push(new AIMessage(msg.content));
      continue;
    }
    const isLastUser = msg.role === "user" && i === messages.length - 1;
    if (msg.role === "user" && isLastUser && imageDataUrl) {
      out.push(
        new HumanMessage({
          content: [
            { type: "text", text: msg.content || "¿Qué hay en esta imagen?" },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        })
      );
    } else {
      out.push(new HumanMessage(msg.content));
    }
  }
  return out;
}

/** Límite de pasos del agente (modelo + tools) para evitar loops y controlar costo. */
const AGENT_RECURSION_LIMIT = 20;

export const maxDuration = 60;

/**
 * POST /api/agent
 * Body: { messages: { role: "user" | "assistant", content: string }[], imageBase64?: string }
 * - messages: historial de conversación (el último puede ser el mensaje actual).
 * - imageBase64: imagen en base64, data URL (data:image/...;base64,...) o URL pública. Se normaliza en backend para el modelo de visión.
 * Responde con el último mensaje del asistente y el historial actualizado.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado. Iniciá sesión para usar el agente." }, { status: 401 });
  }

  if (!isLangChainAvailable()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY no configurada. Añádela en .env.local." },
      { status: 503 }
    );
  }
  try {
    const body = await request.json();
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    const imageInput = typeof body?.imageBase64 === "string" ? body.imageBase64 : null;

    const typed = rawMessages.filter(
      (m: unknown): m is { role: MessageRole; content: string } =>
        m != null &&
        typeof m === "object" &&
        "role" in m &&
        (m.role === "user" || m.role === "assistant") &&
        "content" in m &&
        typeof (m as { content: unknown }).content === "string"
    );
    if (typed.length === 0 && !imageInput) {
      return NextResponse.json(
        { error: "Envía al menos un mensaje en 'messages' o una imagen en 'imageBase64'." },
        { status: 400 }
      );
    }

    const imageDataUrl = imageInput ? await prepareImageForAgent(imageInput) : null;
    const messages = buildMessages(typed, imageDataUrl);
    if (messages.length === 0 && imageDataUrl) {
      messages.push(
        new HumanMessage({
          content: [
            { type: "text", text: "¿Qué hay en esta imagen?" },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        })
      );
    }

    const result = await lisualAgent.invoke(
      { messages },
      { recursionLimit: AGENT_RECURSION_LIMIT }
    );

    const resultMessages = (result as { messages?: unknown[] }).messages ?? [];
    const extractContent = (msg: unknown): string => {
      if (!msg || typeof msg !== "object") return "";
      const c = (msg as { content?: unknown }).content;
      if (typeof c === "string") return c;
      if (Array.isArray(c))
        return (c as { type?: string; text?: string }[])
          .filter((b) => b?.type === "text" && typeof b.text === "string")
          .map((b) => (b as { text: string }).text)
          .join("");
      return "";
    };
    const lastMessage = resultMessages[resultMessages.length - 1];
    const content = extractContent(lastMessage);

    return NextResponse.json({
      content: content || "(Sin respuesta de texto)",
      messages: resultMessages,
    });
  } catch (err) {
    console.error("[api/agent]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al ejecutar el agente." },
      { status: 500 }
    );
  }
}
