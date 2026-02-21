import { describe, it, expect } from "vitest";
import {
  presupuestoSchema,
  presupuestoItemSchema,
} from "./presupuesto";

describe("presupuestoItemSchema", () => {
  it("acepta ítem válido", () => {
    const result = presupuestoItemSchema.safeParse({
      descripcion: "Cámara IP",
      cantidad: 2,
      precio_unitario: 15000,
    });
    expect(result.success).toBe(true);
  });

  it("rechaza descripción vacía", () => {
    const result = presupuestoItemSchema.safeParse({
      descripcion: "",
      cantidad: 1,
      precio_unitario: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cantidad cero", () => {
    const result = presupuestoItemSchema.safeParse({
      descripcion: "Item",
      cantidad: 0,
      precio_unitario: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rechaza precio negativo", () => {
    const result = presupuestoItemSchema.safeParse({
      descripcion: "Item",
      cantidad: 1,
      precio_unitario: -10,
    });
    expect(result.success).toBe(false);
  });
});

describe("presupuestoSchema", () => {
  const validPresupuesto = {
    lead_id: "550e8400-e29b-41d4-a716-446655440000",
    numero: "PRE-001",
    fecha_emision: "2025-02-18",
    vigencia_hasta: "2025-03-18",
    items: [{ descripcion: "Servicio", cantidad: 1, precio_unitario: 10000 }],
  };

  it("acepta presupuesto válido", () => {
    const result = presupuestoSchema.safeParse(validPresupuesto);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.moneda).toBe("ARS");
      expect(result.data.estado).toBe("borrador");
    }
  });

  it("rechaza lead_id no UUID", () => {
    const result = presupuestoSchema.safeParse({
      ...validPresupuesto,
      lead_id: "no-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza items vacío", () => {
    const result = presupuestoSchema.safeParse({
      ...validPresupuesto,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("acepta moneda USD", () => {
    const result = presupuestoSchema.safeParse({
      ...validPresupuesto,
      moneda: "USD",
    });
    expect(result.success).toBe(true);
  });
});
