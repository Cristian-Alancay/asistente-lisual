import { cacheHeaders } from "@/lib/api-headers";

/**
 * Dólar oficial (BNA / Banco Nación estilo) - cotización venta.
 * Usa dolarapi.com que agrega datos del BCRA y bancos oficiales.
 * Cache público 5 min, revalidación en segundo plano.
 */
export const revalidate = 300; // 5 min

export async function GET() {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/oficial", {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      const text = await res.text();
      return Response.json(
        { error: "Error al obtener cotización", detail: text },
        { status: res.status, headers: cacheHeaders.publicRevalidate(60, 30) }
      );
    }
    const data = (await res.json()) as { compra?: number; venta?: number };
    const venta = typeof data.venta === "number" ? data.venta : 0;
    return Response.json(
      { venta },
      { headers: cacheHeaders.publicRevalidate(300, 60) }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return Response.json(
      { error: msg },
      { status: 500, headers: cacheHeaders.publicRevalidate(60, 30) }
    );
  }
}
