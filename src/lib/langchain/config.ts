import { ChatOpenAI } from "@langchain/openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Indica si LangChain/OpenAI está configurado y disponible.
 */
export function isLangChainAvailable(): boolean {
  return Boolean(OPENAI_API_KEY?.trim());
}

/**
 * Crea una instancia de ChatOpenAI para uso en servidor.
 * Solo debe llamarse cuando isLangChainAvailable() es true.
 */
export function getChatModel(options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  if (!OPENAI_API_KEY?.trim()) {
    throw new Error("OPENAI_API_KEY no está configurada. Configura la variable de entorno.");
  }
  return new ChatOpenAI({
    model: options?.model ?? "gpt-4o-mini",
    temperature: options?.temperature ?? 0.3,
    maxTokens: options?.maxTokens ?? 1024,
    apiKey: OPENAI_API_KEY,
  });
}

/**
 * Modelo con visión (multimodal) para OCR, análisis de imágenes y capturas.
 * Usar para mensajes que incluyan imágenes (base64 o URL).
 */
export function getVisionModel(options?: { maxTokens?: number }) {
  if (!OPENAI_API_KEY?.trim()) {
    throw new Error("OPENAI_API_KEY no está configurada.");
  }
  return new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.2,
    maxTokens: options?.maxTokens ?? 1024,
    apiKey: OPENAI_API_KEY,
  });
}
