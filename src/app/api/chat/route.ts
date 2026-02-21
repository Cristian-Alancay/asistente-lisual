import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { isLangChainAvailable } from "@/lib/langchain";
import { trabajoAgent } from "@/lib/langchain/agent";
import { createClient } from "@/lib/supabase/server";
import { saveChatMessage } from "@/lib/actions/chat";
import { cacheHeaders } from "@/lib/api-headers";

type MessageInput = { role: "user" | "assistant"; content: string };

const AGENT_RECURSION_LIMIT = 20;

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isLangChainAvailable()) {
    return Response.json(
      { error: "OPENAI_API_KEY no configurada." },
      { status: 503, headers: cacheHeaders.private() }
    );
  }

  let rawMessages: MessageInput[];
  try {
    const body = await req.json();
    const msgs = body?.messages;
    if (Array.isArray(msgs) && msgs.length > 0) {
      rawMessages = msgs.filter(
        (m: unknown): m is MessageInput =>
          m != null &&
          typeof m === "object" &&
          "role" in m &&
          (m.role === "user" || m.role === "assistant") &&
          "content" in m &&
          typeof (m as { content: unknown }).content === "string"
      );
    } else {
      const text = typeof body?.message === "string" ? body.message.trim() : "";
      if (!text) {
        return Response.json(
          { error: "Campo 'messages' o 'message' requerido." },
          { status: 400, headers: cacheHeaders.private() }
        );
      }
      rawMessages = [{ role: "user", content: text }];
    }
  } catch {
    return Response.json(
      { error: "Body JSON inválido." },
      { status: 400, headers: cacheHeaders.private() }
    );
  }

  if (rawMessages.length === 0) {
    return Response.json(
      { error: "Al menos un mensaje es requerido." },
      { status: 400, headers: cacheHeaders.private() }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const lastUser = rawMessages.filter((m) => m.role === "user").pop();
    if (lastUser?.content.trim()) {
      await saveChatMessage("user", lastUser.content);
    }
  }

  const langchainMessages = rawMessages.map((m) =>
    m.role === "assistant" ? new AIMessage(m.content) : new HumanMessage(m.content)
  );

  const encoder = new TextEncoder();
  let fullText = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await trabajoAgent.stream(
          { messages: langchainMessages },
          { streamMode: "messages", recursionLimit: AGENT_RECURSION_LIMIT }
        );

        for await (const chunk of stream) {
          const [token, metadata] = chunk as [
            { content?: unknown; tool_call_id?: string },
            { langgraph_node?: string },
          ];
          if (
            metadata?.langgraph_node !== "tools" &&
            !token?.tool_call_id &&
            token?.content &&
            typeof token.content === "string"
          ) {
            fullText += token.content;
            controller.enqueue(encoder.encode(token.content));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al procesar.";
        controller.enqueue(encoder.encode(`\n[Error: ${msg}]`));
      } finally {
        if (user && fullText.trim()) {
          saveChatMessage("assistant", fullText).catch(() => {});
        }
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...cacheHeaders.private(),
    },
  });
}
