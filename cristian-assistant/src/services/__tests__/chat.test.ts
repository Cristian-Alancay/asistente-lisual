import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

function chainable() {
  const chain: Record<string, unknown> = {
    select: mockSelect,
    insert: mockInsert,
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
  };
  for (const key of Object.keys(chain)) {
    if (typeof chain[key] === "function") {
      (chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain);
    }
  }
  return chain;
}

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: { getUser: () => mockGetUser() },
  },
}));

let chain: ReturnType<typeof chainable>;

beforeEach(() => {
  vi.clearAllMocks();
  chain = chainable();
  mockFrom.mockReturnValue(chain);
});

describe("chat service", () => {
  it("getChatHistory returns messages for authenticated user", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "u1" } } });
    const msgs = [{ id: "m1", role: "user", content: "hi", created_at: "2026-01-01" }];
    mockLimit.mockResolvedValueOnce({ data: msgs, error: null });

    const { getChatHistory } = await import("@/services/chat");
    const result = await getChatHistory();

    expect(mockFrom).toHaveBeenCalledWith("chat_mensajes");
    expect(mockEq).toHaveBeenCalledWith("usuario_id", "u1");
    expect(result).toEqual(msgs);
  });

  it("getChatHistory returns empty array if no user", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const { getChatHistory } = await import("@/services/chat");
    const result = await getChatHistory();

    expect(result).toEqual([]);
  });

  it("saveChatMessage inserts message for authenticated user", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "u1" } } });
    mockInsert.mockResolvedValueOnce({ error: null });

    const { saveChatMessage } = await import("@/services/chat");
    await saveChatMessage("user", "hello");

    expect(mockFrom).toHaveBeenCalledWith("chat_mensajes");
    expect(mockInsert).toHaveBeenCalledWith({
      usuario_id: "u1",
      role: "user",
      content: "hello",
    });
  });

  it("saveChatMessage does nothing if no user", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const { saveChatMessage } = await import("@/services/chat");
    await saveChatMessage("user", "hello");

    expect(mockFrom).not.toHaveBeenCalled();
  });
});
