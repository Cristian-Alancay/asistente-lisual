import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { getChatModel } from "./config.ts";

export const IntentSchema = z.object({
  intent: z
    .enum([
      "crear_lead",
      "consultar_presupuesto",
      "consultar_estado",
      "agendar_visita",
      "informacion_servicios",
      "otro",
    ])
    .describe("La intención principal del mensaje del usuario."),
  confianza: z
    .number()
    .min(0)
    .max(1)
    .describe("Confianza de la clasificación entre 0 y 1."),
  resumen: z
    .string()
    .describe("Breve resumen del mensaje en una frase."),
  datos_extraidos: z
    .record(z.string(), z.string())
    .optional()
    .describe("Datos útiles extraídos: nombre, teléfono, email, etc."),
});

export type IntentResult = z.infer<typeof IntentSchema>;

const SYSTEM_PROMPT = `Eres un clasificador de intenciones para un asistente de negocio (Assistant Cristian Alancay).
Clasifica el mensaje del usuario en UNA de estas intenciones:
- crear_lead: quiere dejar datos para que lo contacten, registrarse, ser prospecto.
- consultar_presupuesto: pregunta por precios, cotización, presupuesto.
- consultar_estado: pregunta estado de un pedido, instalación, seguimiento.
- agendar_visita: quiere agendar una visita, cita, reunión.
- informacion_servicios: pregunta qué servicios ofrecen, productos, características.
- otro: saludos, despedidas, preguntas genéricas o que no encajan arriba.

Responde en JSON con: intent, confianza (0-1), resumen (una frase), y opcionalmente datos_extraidos (objeto con nombre, telefono, email, etc. si los menciona).`;

export async function detectIntent(message: string): Promise<IntentResult> {
  const llm = getChatModel({ temperature: 0 });
  const structuredLlm = llm.withStructuredOutput(IntentSchema);
  const result = await structuredLlm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(message),
  ]);
  return result as IntentResult;
}
