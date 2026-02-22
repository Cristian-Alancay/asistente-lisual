import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { jsonResponse, errorResponse, corsResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { sendWhatsAppText } from "../_shared/evolution.ts";

const MENSAJES: Record<string, string> = {
  d3: "Hola! Te contactamos de Assistant Cristian Alancay. Hace 3 días te enviamos un presupuesto. ¿Podemos ayudarte con alguna consulta?",
  d7: "Hola! Te escribimos de Assistant Cristian Alancay. Hace una semana te enviamos un presupuesto. ¿Tenés alguna duda o querés que lo revisemos juntos?",
  pre_vencimiento:
    "Hola! Te recordamos de Assistant Cristian Alancay que tu presupuesto vence pronto. Si tenés consultas o querés concretar, estamos para ayudarte.",
};

type SeguimientoPendiente = {
  id: string;
  presupuesto_id: string;
  tipo: string;
  programado_para: string;
  canal: string | null;
  lead_telefono: string | null;
  lead_email: string | null;
  lead_nombre: string | null;
  presupuesto_numero: string | null;
  presupuesto_total: number;
  presupuesto_moneda: string;
  presupuesto_vigencia: string | null;
};

async function getSeguimientosPendientes(): Promise<SeguimientoPendiente[]> {
  const supabase = createServiceClient();

  const { data: seguimientos, error } = await supabase
    .from("seguimientos")
    .select("id, presupuesto_id, tipo, programado_para, canal")
    .is("ejecutado_at", null)
    .lte("programado_para", new Date().toISOString());

  if (error) throw error;
  if (!seguimientos?.length) return [];

  const ids = seguimientos.map((s) => s.presupuesto_id);
  const { data: presupuestos } = await supabase
    .from("presupuestos")
    .select("id, lead_id, numero, total, moneda, vigencia_hasta")
    .in("id", ids);

  const leadIds = [...new Set((presupuestos ?? []).map((p) => p.lead_id))];
  const { data: leads } = await supabase
    .from("leads")
    .select("id, nombre, telefono, email")
    .in("id", leadIds);

  const leadMap = new Map((leads ?? []).map((l) => [l.id, l]));
  const presupuestoMap = new Map(
    (presupuestos ?? []).map((p) => [p.id, p])
  );

  return seguimientos.map((s) => {
    const pres = presupuestoMap.get(s.presupuesto_id);
    const lead = pres ? leadMap.get(pres.lead_id) : null;
    return {
      ...s,
      lead_telefono: lead?.telefono ?? null,
      lead_email: lead?.email ?? null,
      lead_nombre: lead?.nombre ?? null,
      presupuesto_numero: pres?.numero ?? null,
      presupuesto_total: Number(pres?.total ?? 0),
      presupuesto_moneda: pres?.moneda ?? "USD",
      presupuesto_vigencia: pres?.vigencia_hasta ?? null,
    };
  });
}

async function sendSeguimientoEmail(s: SeguimientoPendiente): Promise<boolean> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return false;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "x-cron-call": "true",
      },
      body: JSON.stringify({
        type: "seguimiento",
        to: s.lead_email,
        data: {
          clientName: s.lead_nombre ?? "Cliente",
          tipo: s.tipo,
          numero: s.presupuesto_numero ?? "—",
          total: s.presupuesto_total,
          moneda: s.presupuesto_moneda,
          vigenciaHasta: s.presupuesto_vigencia ?? "—",
        },
        seguimiento_id: s.id,
        presupuesto_id: s.presupuesto_id,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[cron] sendSeguimientoEmail error:", err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();
  if (req.method !== "GET" && req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  const authHeader = req.headers.get("authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    let pendientes: SeguimientoPendiente[];
    try {
      pendientes = await getSeguimientosPendientes();
    } catch (e) {
      console.error("[cron] getSeguimientosPendientes:", e);
      return errorResponse("DB error fetching seguimientos", 500);
    }

    const supabase = createServiceClient();
    let processed = 0;

    for (const s of pendientes) {
      const text = MENSAJES[s.tipo] ?? MENSAJES.d3;
      let sent = false;
      let canalUsado = "none";

      if (s.canal === "whatsapp" && s.lead_telefono) {
        sent = await sendWhatsAppText(s.lead_telefono, text);
        canalUsado = "whatsapp";
      } else if (s.canal === "email" && s.lead_email) {
        sent = await sendSeguimientoEmail(s);
        canalUsado = "email";
      }

      if (sent || (!s.lead_telefono && !s.lead_email)) {
        await supabase
          .from("seguimientos")
          .update({
            ejecutado_at: new Date().toISOString(),
            contenido_usado: canalUsado,
          })
          .eq("id", s.id);
        processed++;
      }
    }

    return jsonResponse({ ok: true, processed });
  } catch (error) {
    console.error("[cron]", error);
    return errorResponse("Cron failed", 500);
  }
});
