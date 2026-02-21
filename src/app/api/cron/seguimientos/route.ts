import { NextRequest, NextResponse } from "next/server";
import {
  getSeguimientosPendientes,
  marcarSeguimientoEjecutado,
} from "@/lib/actions/seguimientos";
import { sendWhatsAppText } from "@/lib/evolution";
import { cacheHeaders } from "@/lib/api-headers";

const MENSAJES: Record<string, string> = {
  d3: "Hola! Te contactamos de Assistant Cristian Alancay. Hace 3 días te enviamos un presupuesto. ¿Podemos ayudarte con alguna consulta?",
  d7: "Hola! Te escribimos de Assistant Cristian Alancay. Hace una semana te enviamos un presupuesto. ¿Tenés alguna duda o querés que lo revisemos juntos?",
  pre_vencimiento:
    "Hola! Te recordamos de Assistant Cristian Alancay que tu presupuesto vence pronto. Si tenés consultas o querés concretar, estamos para ayudarte.",
};

/**
 * Cron diario de seguimientos automáticos
 * Vercel Cron: 0 8 * * * (8:00 diario)
 * Busca seguimientos con programado_para <= now y ejecutado_at IS NULL
 * Envía mensaje por WhatsApp y marca como ejecutado
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: cacheHeaders.private() }
    );
  }

  try {
    let pendientes;
    try {
      pendientes = await getSeguimientosPendientes(true);
    } catch (e) {
      console.error("[cron/seguimientos] getSeguimientosPendientes:", e);
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY required or DB error" },
      { status: 500, headers: cacheHeaders.private() }
    );
    }

    let processed = 0;

    for (const s of pendientes) {
      const text = MENSAJES[s.tipo] ?? MENSAJES.d3;
      let sent = false;

      if (s.canal === "whatsapp" && s.lead_telefono) {
        sent = await sendWhatsAppText(s.lead_telefono, text);
      } else if (s.canal === "email" && s.lead_email) {
        // Email: log por ahora (opcional Resend en el futuro)
        console.log("[cron/seguimientos] Email skip (no Resend):", s.lead_email);
        sent = true; // Marcar como "procesado" aunque no enviamos
      }

      if (sent || s.canal !== "whatsapp") {
        await marcarSeguimientoEjecutado(s.id, "cont1", true);
        processed++;
      }
    }

    return NextResponse.json(
      { ok: true, processed },
      { headers: cacheHeaders.private() }
    );
  } catch (error) {
    console.error("[cron/seguimientos]", error);
    return NextResponse.json(
      { error: "Cron failed" },
      { status: 500, headers: cacheHeaders.private() }
    );
  }
}
