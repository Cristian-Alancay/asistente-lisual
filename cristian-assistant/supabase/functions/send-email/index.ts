import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, getUser } from "../_shared/supabase.ts";
import { renderPresupuestoEmail } from "../_shared/email-templates/presupuesto-template.ts";
import { renderSeguimientoEmail } from "../_shared/email-templates/seguimiento-template.ts";
import { renderNotificacionEmail } from "../_shared/email-templates/notificacion-template.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Lisual <onboarding@resend.dev>";

interface EmailPayload {
  type: "presupuesto" | "seguimiento" | "notificacion" | "general";
  to: string;
  data: Record<string, unknown>;
  attachments?: { filename: string; content: string }[];
  presupuesto_id?: string;
  seguimiento_id?: string;
}

function renderTemplate(payload: EmailPayload): { subject: string; html: string } {
  switch (payload.type) {
    case "presupuesto":
      return renderPresupuestoEmail(payload.data as Parameters<typeof renderPresupuestoEmail>[0]);
    case "seguimiento":
      return renderSeguimientoEmail(payload.data as Parameters<typeof renderSeguimientoEmail>[0]);
    case "notificacion":
      return renderNotificacionEmail(payload.data as Parameters<typeof renderNotificacionEmail>[0]);
    default: {
      const subject = (payload.data.subject as string) ?? "Notificación | Lisual";
      const html = (payload.data.html as string) ?? "<p>Sin contenido</p>";
      return { subject, html };
    }
  }
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  attachments?: { filename: string; content: string }[],
): Promise<{ id: string }> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const body: Record<string, unknown> = {
    from: FROM_EMAIL,
    to: [to],
    subject,
    html,
  };

  if (attachments?.length) {
    body.attachments = attachments;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend API ${res.status}: ${errText}`);
  }

  return (await res.json()) as { id: string };
}

async function logEmail(
  supabase: ReturnType<typeof createServiceClient>,
  payload: EmailPayload,
  subject: string,
  resendId: string | null,
  estado: "enviado" | "error",
  errorDetail?: string,
) {
  await supabase.from("email_log").insert({
    tipo: payload.type,
    destinatario: payload.to,
    asunto: subject,
    presupuesto_id: payload.presupuesto_id ?? null,
    seguimiento_id: payload.seguimiento_id ?? null,
    estado,
    resend_id: resendId,
    error_detail: errorDetail ?? null,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  const isCronCall = req.headers.get("x-cron-call") === "true";
  if (!isCronCall) {
    const user = await getUser(req);
    if (!user) return errorResponse("Unauthorized", 401);
  }

  try {
    const payload = (await req.json()) as EmailPayload;

    if (!payload.to || !payload.type) {
      return errorResponse("Missing required fields: to, type", 400);
    }

    const { subject, html } = renderTemplate(payload);
    const supabase = createServiceClient();

    let resendId: string | null = null;
    try {
      const result = await sendViaResend(payload.to, subject, html, payload.attachments);
      resendId = result.id;
      await logEmail(supabase, payload, subject, resendId, "enviado");
    } catch (sendErr) {
      const errMsg = sendErr instanceof Error ? sendErr.message : String(sendErr);
      console.error("[send-email] Resend error:", errMsg);
      await logEmail(supabase, payload, subject, null, "error", errMsg);
      return errorResponse(errMsg, 502);
    }

    return jsonResponse({ ok: true, resend_id: resendId, subject });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-email]", msg);
    return errorResponse(msg, 500);
  }
});
