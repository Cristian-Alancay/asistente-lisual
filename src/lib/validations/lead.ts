import { z } from "zod";

export const leadSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  empresa: z.string().optional(),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  canal_origen: z.enum(["reunion", "manual", "web", "referencia", "whatsapp"]),
  estado: z.enum(["prospecto", "negociacion", "convertido", "perdido"]),
  presupuesto_estimado: z.number().optional(),
  presupuesto_estimado_moneda: z.enum(["USD", "ARS"]).optional().default("ARS"),
  link_reunion: z.union([z.string().url("URL inválida"), z.literal("")]).optional(),
  necesidad: z.string().optional(),
  fecha_decision_estimada: z.string().optional(),
  notas: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
