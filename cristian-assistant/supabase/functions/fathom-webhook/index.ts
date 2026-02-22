import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

const WEBHOOK_SECRET = Deno.env.get("FATHOM_WEBHOOK_SECRET") ?? "";

// ---------------------------------------------------------------------------
// Fathom payload types (subset)
// ---------------------------------------------------------------------------

interface FathomInvitee {
  name: string | null;
  email: string | null;
  email_domain: string | null;
  is_external: boolean;
}

interface FathomTranscriptItem {
  speaker: { display_name: string; matched_calendar_invitee_email?: string | null };
  text: string;
  timestamp: string;
}

interface FathomActionItem {
  description: string;
  user_generated: boolean;
  completed: boolean;
  recording_timestamp: string;
  recording_playback_url: string;
  assignee: { name: string | null; email: string | null };
}

interface FathomPayload {
  title: string;
  meeting_title: string | null;
  recording_id: number;
  url: string;
  share_url: string;
  created_at: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  recording_start_time: string;
  recording_end_time: string;
  calendar_invitees: FathomInvitee[];
  transcript_language: string;
  transcript?: FathomTranscriptItem[] | null;
  default_summary?: { template_name: string | null; markdown_formatted: string | null } | null;
  action_items?: FathomActionItem[] | null;
  recorded_by: { name: string; email: string; email_domain: string };
}

// ---------------------------------------------------------------------------
// Webhook signature verification (HMAC-SHA256)
// ---------------------------------------------------------------------------

async function verifySignature(
  secret: string,
  headers: Headers,
  rawBody: string,
): Promise<boolean> {
  if (!secret) return true; // skip if no secret configured

  const webhookId = headers.get("webhook-id");
  const webhookTs = headers.get("webhook-timestamp");
  const webhookSig = headers.get("webhook-signature");

  if (!webhookId || !webhookTs || !webhookSig) return false;

  const ts = parseInt(webhookTs, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false; // 5 min tolerance

  const signedContent = `${webhookId}.${webhookTs}.${rawBody}`;
  const secretBytes = Uint8Array.from(atob(secret.replace("whsec_", "")), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedContent));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));

  const signatures = webhookSig.split(" ").map((s) => {
    const parts = s.split(",");
    return parts.length > 1 ? parts[1] : parts[0];
  });

  return signatures.some((s) => s === expected);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  const rawBody = await req.text();

  if (WEBHOOK_SECRET) {
    const valid = await verifySignature(WEBHOOK_SECRET, req.headers, rawBody);
    if (!valid) return errorResponse("Invalid signature", 401);
  }

  let payload: FathomPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return errorResponse("Invalid JSON", 400);
  }

  if (!payload.recording_id) {
    return jsonResponse({ ok: true, skipped: true, reason: "no recording_id" });
  }

  const supabase = createServiceClient();

  try {
    // 1. Extract external participants
    const externals = (payload.calendar_invitees ?? []).filter(
      (i) => i.is_external && i.email,
    );

    // 2. Match or create leads for each external participant
    let primaryLeadId: string | null = null;
    const participantRows: { lead_id: string | null; nombre: string | null; email: string; es_externo: boolean }[] = [];

    for (const ext of externals) {
      const email = ext.email!.toLowerCase();

      // Try to find existing lead by email
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .ilike("email", email)
        .limit(1)
        .maybeSingle();

      let leadId: string;

      if (existingLead) {
        leadId = existingLead.id;
        if (!primaryLeadId) primaryLeadId = leadId; // first existing lead = primary
      } else {
        // Create new lead from meeting participant
        const { data: newLead, error: insertErr } = await supabase
          .from("leads")
          .insert({
            nombre: ext.name || email.split("@")[0],
            email,
            empresa: ext.email_domain || null,
            canal_origen: "reunion",
            estado: "nuevo",
          })
          .select("id")
          .single();

        if (insertErr) {
          console.error("[fathom-webhook] Failed to create lead:", insertErr);
          continue;
        }
        leadId = newLead.id;
      }

      participantRows.push({
        lead_id: leadId,
        nombre: ext.name,
        email: ext.email!,
        es_externo: true,
      });
    }

    // Also add internal participants (for reference)
    const internals = (payload.calendar_invitees ?? []).filter((i) => !i.is_external && i.email);
    for (const int of internals) {
      participantRows.push({
        lead_id: null,
        nombre: int.name,
        email: int.email!,
        es_externo: false,
      });
    }

    // Fallback: if no existing lead was primary, use the first external created
    if (!primaryLeadId && participantRows.length > 0) {
      primaryLeadId = participantRows.find((p) => p.es_externo)?.lead_id ?? null;
    }

    // 3. Upsert reunion
    const reunionData = {
      fathom_recording_id: payload.recording_id,
      lead_id: primaryLeadId,
      titulo: payload.title,
      titulo_calendario: payload.meeting_title,
      resumen_md: payload.default_summary?.markdown_formatted ?? null,
      transcripcion: payload.transcript ? JSON.parse(JSON.stringify(payload.transcript)) : null,
      action_items: payload.action_items ? JSON.parse(JSON.stringify(payload.action_items)) : null,
      fathom_url: payload.url,
      share_url: payload.share_url,
      fecha_reunion: payload.recording_start_time || payload.scheduled_start_time,
      fecha_fin: payload.recording_end_time || payload.scheduled_end_time,
      fecha_hora: payload.scheduled_start_time,
      duracion_min: Math.round(
        (new Date(payload.recording_end_time || payload.scheduled_end_time).getTime() -
          new Date(payload.recording_start_time || payload.scheduled_start_time).getTime()) /
          60000,
      ),
      idioma: payload.transcript_language || "es",
      raw: JSON.parse(rawBody),
    };

    const { data: reunion, error: upsertErr } = await supabase
      .from("reuniones")
      .upsert(reunionData, { onConflict: "fathom_recording_id" })
      .select("id")
      .single();

    if (upsertErr) {
      console.error("[fathom-webhook] Upsert reunion error:", upsertErr);
      return errorResponse("Failed to save reunion", 500);
    }

    // 4. Insert participants (ignore conflicts on duplicate email per reunion)
    if (participantRows.length > 0 && reunion) {
      const rows = participantRows.map((p) => ({
        reunion_id: reunion.id,
        lead_id: p.lead_id,
        nombre: p.nombre,
        email: p.email,
        es_externo: p.es_externo,
      }));

      const { error: partErr } = await supabase
        .from("reunion_participantes")
        .upsert(rows, { onConflict: "reunion_id,email" });

      if (partErr) {
        console.error("[fathom-webhook] Participants error:", partErr);
      }
    }

    console.log(
      `[fathom-webhook] Processed meeting ${payload.recording_id}: ` +
        `${externals.length} externals, lead=${primaryLeadId ?? "none"}`,
    );

    return jsonResponse({
      ok: true,
      reunion_id: reunion?.id,
      lead_id: primaryLeadId,
      participants: participantRows.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[fathom-webhook]", msg);
    return errorResponse(msg, 500);
  }
});
