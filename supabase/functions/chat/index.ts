import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { corsHeaders, corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createUserClient, getUser } from "../_shared/supabase.ts";
import { isLangChainAvailable } from "../_shared/langchain/config.ts";
import { trabajoAgent } from "../_shared/langchain/agent.ts";

type MessageInput = { role: "user" | "assistant"; content: string };

const AGENT_RECURSION_LIMIT = 20;

async function handleHistory(req: Request): Promise<Response> {
  const user = await getUser(req);
  if (!user) return errorResponse("No autenticado", 401);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "50", 10) || 50,
    100
  );

  const client = createUserClient(req);
  const { data, error } = await client
    .from("chat_mensajes")
    .select("id, role, content, created_at")
    .eq("usuario_id", user.id)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) return errorResponse(error.message, 500);
  return jsonResponse(data ?? []);
}

async function saveChatMessage(
  req: Request,
  userId: string,
  role: "user" | "assistant",
  content: string
) {
  try {
    const client = createUserClient(req);
    await client
      .from("chat_mensajes")
      .insert({ usuario_id: userId, role, content });
  } catch {
    // Best-effort save
  }
}

async function handleChat(req: Request): Promise<Response> {
  if (!isLangChainAvailable()) {
    return errorResponse("OPENAI_API_KEY no configurada.", 503);
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
          ((m as MessageInput).role === "user" ||
            (m as MessageInput).role === "assistant") &&
          "content" in m &&
          typeof (m as MessageInput).content === "string"
      );
    } else {
      const text =
        typeof body?.message === "string" ? body.message.trim() : "";
      if (!text) return errorResponse("Campo 'messages' o 'message' requerido.", 400);
      rawMessages = [{ role: "user", content: text }];
    }
  } catch {
    return errorResponse("Body JSON inválido.", 400);
  }

  if (rawMessages.length === 0) {
    return errorResponse("Al menos un mensaje es requerido.", 400);
  }

  const user = await getUser(req);

  if (user) {
    const lastUser = rawMessages.filter((m) => m.role === "user").pop();
    if (lastUser?.content.trim()) {
      await saveChatMessage(req, user.id, "user", lastUser.content);
    }
  }

  const langchainMessages = rawMessages.map((m) =>
    m.role === "assistant"
      ? new AIMessage(m.content)
      : new HumanMessage(m.content)
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
            { langgraph_node?: string }
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
          saveChatMessage(req, user.id, "assistant", fullText).catch(() => {});
        }
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  if (req.method === "GET" && path === "history") {
    return handleHistory(req);
  }

  if (req.method === "POST") {
    return handleChat(req);
  }

  return errorResponse("Method not allowed", 405);
});
