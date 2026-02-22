import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getUser } from "../_shared/supabase.ts";
import { isLangChainAvailable } from "../_shared/langchain/config.ts";
import { trabajoAgent } from "../_shared/langchain/agent.ts";
import { prepareImageForAgent } from "../_shared/langchain/multimedia.ts";
import { extractContent } from "../_shared/langchain/extract-content.ts";

type MessageRole = "user" | "assistant";

function buildMessages(
  messages: { role: MessageRole; content: string }[],
  imageDataUrl?: string | null
) {
  const out: (InstanceType<typeof HumanMessage> | InstanceType<typeof AIMessage>)[] =
    [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "assistant") {
      out.push(new AIMessage(msg.content));
      continue;
    }
    const isLastUser = msg.role === "user" && i === messages.length - 1;
    if (isLastUser && imageDataUrl) {
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

const AGENT_RECURSION_LIMIT = 20;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  const user = await getUser(req);
  if (!user) {
    return errorResponse("No autenticado. Iniciá sesión para usar el agente.", 401);
  }

  if (!isLangChainAvailable()) {
    return errorResponse("OPENAI_API_KEY no configurada.", 503);
  }

  try {
    const body = await req.json();
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    const imageInput =
      typeof body?.imageBase64 === "string" ? body.imageBase64 : null;

    const typed = rawMessages.filter(
      (m: unknown): m is { role: MessageRole; content: string } =>
        m != null &&
        typeof m === "object" &&
        "role" in m &&
        ((m as { role: string }).role === "user" ||
          (m as { role: string }).role === "assistant") &&
        "content" in m &&
        typeof (m as { content: unknown }).content === "string"
    );

    if (typed.length === 0 && !imageInput) {
      return errorResponse(
        "Envía al menos un mensaje en 'messages' o una imagen en 'imageBase64'.",
        400
      );
    }

    const imageDataUrl = imageInput
      ? await prepareImageForAgent(imageInput)
      : null;
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

    const result = await trabajoAgent.invoke(
      { messages },
      { recursionLimit: AGENT_RECURSION_LIMIT }
    );

    const resultMessages =
      (result as { messages?: unknown[] }).messages ?? [];
    const lastMessage = resultMessages[resultMessages.length - 1];
    const content = extractContent(lastMessage);

    return jsonResponse({
      content: content || "(Sin respuesta de texto)",
      messages: resultMessages,
    });
  } catch (err) {
    console.error("[agent]", err);
    return errorResponse(
      err instanceof Error ? err.message : "Error al ejecutar el agente.",
      500
    );
  }
});
