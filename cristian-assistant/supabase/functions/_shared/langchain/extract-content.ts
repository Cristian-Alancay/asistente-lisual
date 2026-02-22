export function extractContent(msg: unknown): string {
  if (!msg || typeof msg !== "object") return "";
  const c = (msg as { content?: unknown }).content;
  if (typeof c === "string") return c;
  if (Array.isArray(c))
    return (c as { type?: string; text?: string }[])
      .filter((b) => b?.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("");
  return "";
}
