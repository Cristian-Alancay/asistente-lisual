const DOLAR_API = "https://dolarapi.com/v1/dolares/oficial";

export async function getDolarOficial(): Promise<{ venta: number; compra: number } | null> {
  try {
    const res = await fetch(DOLAR_API);
    if (!res.ok) return null;
    const data = await res.json();
    return { venta: Number(data.venta), compra: Number(data.compra) };
  } catch {
    return null;
  }
}
