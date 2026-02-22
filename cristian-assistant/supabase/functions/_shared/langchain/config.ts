import { ChatOpenAI } from "@langchain/openai";

function getApiKey(): string {
  const key = Deno.env.get("OPENAI_API_KEY")?.trim();
  if (!key) throw new Error("OPENAI_API_KEY no configurada.");
  return key;
}

export function isLangChainAvailable(): boolean {
  return Boolean(Deno.env.get("OPENAI_API_KEY")?.trim());
}

export function getChatModel(options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  return new ChatOpenAI({
    model: options?.model ?? "gpt-4o-mini",
    temperature: options?.temperature ?? 0.3,
    maxTokens: options?.maxTokens ?? 1024,
    apiKey: getApiKey(),
  });
}

export function getVisionModel(options?: { maxTokens?: number }) {
  return new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.2,
    maxTokens: options?.maxTokens ?? 1024,
    apiKey: getApiKey(),
  });
}
