import { describe, it, expect } from "vitest";
import { leadSchema } from "./lead";

describe("leadSchema", () => {
  const validLead = {
    nombre: "Juan Pérez",
    email: "juan@ejemplo.com",
    canal_origen: "web" as const,
    estado: "prospecto" as const,
  };

  it("acepta lead mínimo válido", () => {
    const result = leadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.presupuesto_estimado_moneda).toBe("USD");
    }
  });

  it("acepta lead completo", () => {
    const full = {
      ...validLead,
      empresa: "Acme SA",
      telefono: "+5491112345678",
      presupuesto_estimado: 50000,
      presupuesto_estimado_moneda: "USD" as const,
      necesidad: "Cámaras de seguridad",
      notas: "Urgente",
    };
    const result = leadSchema.safeParse(full);
    expect(result.success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = leadSchema.safeParse({ ...validLead, nombre: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza email inválido", () => {
    const result = leadSchema.safeParse({ ...validLead, email: "no-email" });
    expect(result.success).toBe(false);
  });

  it("rechaza canal_origen inválido", () => {
    const result = leadSchema.safeParse({ ...validLead, canal_origen: "fax" });
    expect(result.success).toBe(false);
  });

  it("rechaza estado inválido", () => {
    const result = leadSchema.safeParse({ ...validLead, estado: "pendiente" });
    expect(result.success).toBe(false);
  });

  it("acepta link_reunion URL válida", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      link_reunion: "https://meet.google.com/abc-defg-hij",
    });
    expect(result.success).toBe(true);
  });

  it("acepta link_reunion vacío", () => {
    const result = leadSchema.safeParse({ ...validLead, link_reunion: "" });
    expect(result.success).toBe(true);
  });

  it("rechaza link_reunion URL inválida", () => {
    const result = leadSchema.safeParse({ ...validLead, link_reunion: "no-url" });
    expect(result.success).toBe(false);
  });
});
