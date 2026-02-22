import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getChatModel } from "./config.ts";

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
