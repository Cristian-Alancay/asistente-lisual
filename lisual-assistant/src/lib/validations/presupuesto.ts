import { z } from "zod";

export const presupuestoItemSchema = z.object({
  descripcion: z.string().min(1, "Descripción requerida"),
  cantidad: z.number().min(0.01),
  precio_unitario: z.number().min(0),
});

export const presupuestoSchema = z.object({
  lead_id: z.string().uuid("Selecciona un lead"),
  numero: z.string().min(1, "Número requerido"),
  fecha_emision: z.string().min(1, "Fecha de emisión requerida"),
  vigencia_hasta: z.string().min(1, "Vigencia hasta requerida"),
  items: z.array(presupuestoItemSchema).min(1, "Al menos un ítem"),
  moneda: z.enum(["ARS", "USD"]).default("ARS"),
  estado: z.enum(["borrador", "enviado", "aceptado", "rechazado", "vencido"]).default("borrador"),
});

export type PresupuestoFormData = z.infer<typeof presupuestoSchema>;
export type PresupuestoItem = z.infer<typeof presupuestoItemSchema>;
