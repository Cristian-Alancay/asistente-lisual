import { describe, it, expect, vi, beforeEach } from "vitest";

const DOLAR_API = "https://dolarapi.com/v1/dolares/oficial";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("dolar service", () => {
  it("returns venta/compra on success", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ venta: 1050, compra: 1000 }),
    });

    const { getDolarOficial } = await import("@/services/dolar");
    const result = await getDolarOficial();

    expect(globalThis.fetch).toHaveBeenCalledWith(DOLAR_API);
    expect(result).toEqual({ venta: 1050, compra: 1000 });
  });

  it("returns null on non-ok response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({ ok: false });

    const { getDolarOficial } = await import("@/services/dolar");
    const result = await getDolarOficial();

    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error("Network"));

    const { getDolarOficial } = await import("@/services/dolar");
    const result = await getDolarOficial();

    expect(result).toBeNull();
  });
});
