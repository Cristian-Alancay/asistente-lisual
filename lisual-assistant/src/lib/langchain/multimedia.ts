/**
 * Preparación de multimedia (fotos) en el backend para el agente de IA.
 * Normaliza base64, data URL o URL pública a data URL (base64) lista para el modelo de visión.
 */

/** Tamaño máximo en bytes del contenido decodificado de la imagen (ej. 4 MB para visión). */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** Tipos MIME soportados para imágenes. */
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function getMimeFromDataUrl(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:([^;]+);/);
  const mime = match?.[1]?.toLowerCase();
  if (mime && ALLOWED_MIMES.includes(mime)) return mime;
  if (mime?.startsWith("image/")) return mime;
  return null;
}

/**
 * Convierte una URL pública (http/https) a data URL en base64.
 * Respeta MAX_IMAGE_BYTES; devuelve null si la imagen es demasiado grande o falla la descarga.
 */
async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    if (!contentType?.startsWith("image/")) return null;

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_BYTES) return null;

    const base64 = Buffer.from(buffer).toString("base64");
    const mime = ALLOWED_MIMES.includes(contentType) ? contentType : "image/jpeg";
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

/**
 * Prepara una imagen para enviar al agente de IA.
 * Acepta:
 * - data URL (data:image/...;base64,...)
 * - base64 crudo (sin prefijo)
 * - URL pública (http/https) → se descarga en el backend y se convierte a base64
 *
 * Devuelve data URL lista para image_url.url, o null si la entrada es inválida o la imagen es demasiado grande.
 */
export async function prepareImageForAgent(imageInput: string): Promise<string | null> {
  const raw = imageInput?.trim();
  if (!raw || typeof raw !== "string") return null;

  // Ya es data URL
  if (raw.startsWith("data:") && raw.includes("base64,")) {
    const base64Part = raw.slice(raw.indexOf("base64,") + 7);
    try {
      const decoded = Buffer.from(base64Part, "base64");
      if (decoded.length > MAX_IMAGE_BYTES) return null;
      const mime = getMimeFromDataUrl(raw);
      if (!mime) return `data:image/jpeg;base64,${base64Part}`;
      return raw;
    } catch {
      return null;
    }
  }

  // Base64 crudo (sin prefijo)
  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    try {
      const decoded = Buffer.from(raw, "base64");
      if (decoded.length === 0 || decoded.length > MAX_IMAGE_BYTES) return null;
      return `data:image/jpeg;base64,${raw}`;
    } catch {
      return null;
    }
  }

  // URL pública
  return fetchImageAsDataUrl(raw);
}
