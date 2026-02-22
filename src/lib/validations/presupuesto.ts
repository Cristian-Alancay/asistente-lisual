import { z } from "zod";

export const presupuestoItemSchema = z.object({
  descripcion: z.string().min(1, "Descripcion requerida"),
  cantidad: z.number().min(0.01),
  precio_unitario: z.number().min(0),
});

export const presupuestoSchema = z.object({
  lead_id: z.string().uuid("Selecciona un lead"),
  numero: z.string().min(1, "Numero requerido"),
  fecha_emision: z.string().min(1, "Fecha de emision requerida"),
  vigencia_hasta: z.string().min(1, "Vigencia hasta requerida"),
  items: z.array(presupuestoItemSchema).min(1, "Al menos un item"),
  moneda: z.enum(["ARS", "USD"]).default("ARS"),
  estado: z.enum(["borrador", "enviado", "aceptado", "rechazado", "vencido"]).default("borrador"),
  subtotal_override: z.number().optional(),
  impuestos_override: z.number().optional(),
  total_override: z.number().optional(),
});

export type PresupuestoFormData = z.infer<typeof presupuestoSchema>;
export type PresupuestoItem = z.infer<typeof presupuestoItemSchema>;
