const url = () => Deno.env.get("EVOLUTION_API_URL")?.trim();
const key = () => Deno.env.get("EVOLUTION_API_KEY")?.trim();
const instance = () => Deno.env.get("EVOLUTION_INSTANCE")?.trim();

export function isEvolutionAvailable(): boolean {
  return Boolean(url() && key() && instance());
}

export async function sendWhatsAppText(
  number: string,
  text: string
): Promise<boolean> {
  if (!isEvolutionAvailable()) {
    console.warn("[evolution] Not configured");
    return false;
  }

  const normalized = number.replace(/\D/g, "");
  if (!normalized || normalized.length < 10) {
    console.warn("[evolution] Invalid number:", number);
    return false;
  }

  const endpoint = `${url()!.replace(/\/$/, "")}/message/sendText/${instance()}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key()! },
      body: JSON.stringify({ number: normalized, text }),
    });
    if (!res.ok) {
      console.error("[evolution] Send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[evolution] Send error:", err);
    return false;
  }
}
