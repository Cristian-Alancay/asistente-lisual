import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getChatModel } from "./config";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

/**
 * Invoca el modelo de chat con un mensaje de usuario y opcional mensaje de sistema.
 * Útil para respuestas libres (asistente, respuestas WhatsApp, etc.).
 */
export async function chat(options: {
  userMessage: string;
  systemMessage?: string;
  model?: string;
  temperature?: number;
}): Promise<string> {
  const llm = getChatModel({
    model: options.model,
    temperature: options.temperature,
  });
  const messages = [];
  if (options.systemMessage) {
    messages.push(new SystemMessage(options.systemMessage));
  }
  messages.push(new HumanMessage(options.userMessage));
  const response = await llm.invoke(messages);
  const content = response.content;
  return typeof content === "string" ? content : String(content ?? "");
}
