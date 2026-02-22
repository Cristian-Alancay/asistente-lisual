import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockSingle = vi.fn();

function chainable(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
    ...overrides,
  };
  for (const key of Object.keys(chain)) {
    if (typeof chain[key] === "function") {
      (chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain);
    }
  }
  return chain;
}

const mockFrom = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

let chain: ReturnType<typeof chainable>;

beforeEach(() => {
  vi.clearAllMocks();
  chain = chainable();
  mockFrom.mockReturnValue(chain);
});

describe("leads service", () => {
  it("getLeads returns data on success", async () => {
    const rows = [{ id: "1", nombre: "Test" }];
    mockOrder.mockResolvedValueOnce({ data: rows, error: null });

    const { getLeads } = await import("@/services/leads");
    const result = await getLeads();

    expect(mockFrom).toHaveBeenCalledWith("leads");
    expect(result).toEqual(rows);
  });

  it("getLeads throws on error", async () => {
    mockOrder.mockResolvedValueOnce({
      data: null,
      error: { message: "DB error" },
    });

    const { getLeads } = await import("@/services/leads");
    await expect(getLeads()).rejects.toEqual({ message: "DB error" });
  });

  it("getLead fetches a single lead by ID", async () => {
    const lead = { id: "abc", nombre: "Jane" };
    mockSingle.mockResolvedValueOnce({ data: lead, error: null });

    const { getLead } = await import("@/services/leads");
    const result = await getLead("abc");

    expect(mockFrom).toHaveBeenCalledWith("leads");
    expect(mockEq).toHaveBeenCalledWith("id", "abc");
    expect(result).toEqual(lead);
  });

  it("createLead inserts a new lead", async () => {
    mockInsert.mockResolvedValueOnce({ error: null });

    const { createLead } = await import("@/services/leads");
    await expect(
      createLead({
        nombre: "Test",
        email: "test@test.com",
        canal_origen: "web",
        estado: "prospecto",
      }),
    ).resolves.toBeUndefined();

    expect(mockFrom).toHaveBeenCalledWith("leads");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: "Test", email: "test@test.com" }),
    );
  });

  it("updateLead updates an existing lead", async () => {
    mockEq.mockResolvedValueOnce({ error: null });

    const { updateLead } = await import("@/services/leads");
    await expect(
      updateLead("abc", {
        nombre: "Updated",
        email: "u@test.com",
        canal_origen: "manual",
        estado: "negociacion",
      }),
    ).resolves.toBeUndefined();

    expect(mockFrom).toHaveBeenCalledWith("leads");
  });

  it("deleteLead removes a lead", async () => {
    mockEq.mockResolvedValueOnce({ error: null });

    const { deleteLead } = await import("@/services/leads");
    await expect(deleteLead("abc")).resolves.toBeUndefined();

    expect(mockFrom).toHaveBeenCalledWith("leads");
  });
});
