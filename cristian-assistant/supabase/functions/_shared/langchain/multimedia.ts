const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function getMimeFromDataUrl(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:([^;]+);/);
  const mime = match?.[1]?.toLowerCase();
  if (mime && ALLOWED_MIMES.includes(mime)) return mime;
  if (mime?.startsWith("image/")) return mime;
  return null;
}

function base64ByteLength(b64: string): number {
  try {
    return atob(b64).length;
  } catch {
    return 0;
  }
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const contentType =
      res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    if (!contentType?.startsWith("image/")) return null;
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_BYTES) return null;
    const base64 = arrayBufferToBase64(buffer);
    const mime = ALLOWED_MIMES.includes(contentType)
      ? contentType
      : "image/jpeg";
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function prepareImageForAgent(
  imageInput: string
): Promise<string | null> {
  const raw = imageInput?.trim();
  if (!raw || typeof raw !== "string") return null;

  if (raw.startsWith("data:") && raw.includes("base64,")) {
    const base64Part = raw.slice(raw.indexOf("base64,") + 7);
    if (base64ByteLength(base64Part) > MAX_IMAGE_BYTES) return null;
    const mime = getMimeFromDataUrl(raw);
    if (!mime) return `data:image/jpeg;base64,${base64Part}`;
    return raw;
  }

  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    const len = base64ByteLength(raw);
    if (len === 0 || len > MAX_IMAGE_BYTES) return null;
    return `data:image/jpeg;base64,${raw}`;
  }

  return fetchImageAsDataUrl(raw);
}
