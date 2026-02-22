import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

const WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET") ?? "";

interface ResendEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject?: string;
    created_at?: string;
    bounce?: { message?: string; type?: string };
    complaint?: { feedback_type?: string };
  };
}

type EmailLogEstado = "enviado" | "error" | "rebotado";

function mapEventToEstado(eventType: string): EmailLogEstado | null {
  switch (eventType) {
    case "email.bounced":
    case "email.complained":
      return "rebotado";
    case "email.delivery_delayed":
      return "error";
    case "email.delivered":
      return "enviado";
    default:
      return null;
  }
}

function extractErrorDetail(event: ResendEvent): string | null {
  if (event.type === "email.bounced") {
    const b = event.data.bounce;
    return b ? `${b.type ?? "bounce"}: ${b.message ?? "unknown"}` : "Bounced";
  }
  if (event.type === "email.complained") {
    return `Complaint: ${event.data.complaint?.feedback_type ?? "abuse"}`;
  }
  if (event.type === "email.delivery_delayed") {
    return "Delivery delayed";
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  if (WEBHOOK_SECRET) {
    const authHeader = req.headers.get("authorization") ?? "";
    const svixId = req.headers.get("svix-id");

    if (!svixId && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return errorResponse("Unauthorized", 401);
    }
  }

  try {
    const event = (await req.json()) as ResendEvent;

    if (!event.type || !event.data?.email_id) {
      return jsonResponse({ ok: true, skipped: true, reason: "no event data" });
    }

    const nuevoEstado = mapEventToEstado(event.type);
    if (!nuevoEstado) {
      return jsonResponse({ ok: true, skipped: true, reason: `unhandled event: ${event.type}` });
    }

    if (nuevoEstado === "enviado") {
      return jsonResponse({ ok: true, skipped: true, reason: "already tracked on send" });
    }

    const supabase = createServiceClient();
    const resendId = event.data.email_id;

    const { data: logEntry, error: findErr } = await supabase
      .from("email_log")
      .select("id, estado")
      .eq("resend_id", resendId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findErr) {
      console.error("[resend-webhook] find error:", findErr);
      return errorResponse("DB find error", 500);
    }

    if (!logEntry) {
      console.warn(`[resend-webhook] No email_log found for resend_id=${resendId}`);
      return jsonResponse({ ok: true, skipped: true, reason: "no matching log entry" });
    }

    const errorDetail = extractErrorDetail(event);

    const { error: updateErr } = await supabase
      .from("email_log")
      .update({
        estado: nuevoEstado,
        ...(errorDetail ? { error_detail: errorDetail } : {}),
      })
      .eq("id", logEntry.id);

    if (updateErr) {
      console.error("[resend-webhook] update error:", updateErr);
      return errorResponse("DB update error", 500);
    }

    console.log(`[resend-webhook] ${event.type} → email_log ${logEntry.id} → ${nuevoEstado}`);
    return jsonResponse({ ok: true, updated: logEntry.id, estado: nuevoEstado });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[resend-webhook]", msg);
    return errorResponse(msg, 500);
  }
});
