/**
 * Evolution API helper for sending WhatsApp messages.
 * Requires: EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL?.trim();
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY?.trim();
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE?.trim();

export function isEvolutionAvailable(): boolean {
  return Boolean(EVOLUTION_API_URL && EVOLUTION_API_KEY && EVOLUTION_INSTANCE);
}

/**
 * Send a plain text WhatsApp message via Evolution API.
 * @param number - Recipient number in E.164 format (e.g. "5491112345678" or "54 9 11 1234-5678")
 * @param text - Message body
 * @returns true if sent successfully, false otherwise
 */
export async function sendWhatsAppText(number: string, text: string): Promise<boolean> {
  if (!isEvolutionAvailable()) {
    console.warn("[evolution] EVOLUTION_API_URL, EVOLUTION_API_KEY or EVOLUTION_INSTANCE not configured");
    return false;
  }

  // Normalize number: remove spaces, dashes, ensure it has country code
  const normalized = number.replace(/\D/g, "");
  if (!normalized || normalized.length < 10) {
    console.warn("[evolution] Invalid number:", number);
    return false;
  }

  const url = `${EVOLUTION_API_URL!.replace(/\/$/, "")}/message/sendText/${EVOLUTION_INSTANCE}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY!,
      },
      body: JSON.stringify({
        number: normalized,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[evolution] Send failed:", res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[evolution] Send error:", err);
    return false;
  }
}
