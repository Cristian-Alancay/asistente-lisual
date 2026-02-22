import { corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { getUser } from "../_shared/supabase.ts";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

async function getGoogleAccessToken(): Promise<string | null> {
  const refreshToken = Deno.env.get("GOOGLE_CALENDAR_REFRESH_TOKEN");
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!refreshToken || !clientId || !clientSecret) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

async function createCalendarEvent(
  accessToken: string,
  params: {
    summary: string;
    start: string;
    end: string;
    description?: string;
    calendarId?: string;
  },
) {
  const calendarId = params.calendarId ?? "primary";
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: params.summary,
        description: params.description ?? "",
        start: { dateTime: params.start, timeZone: "America/Argentina/Buenos_Aires" },
        end: { dateTime: params.end, timeZone: "America/Argentina/Buenos_Aires" },
      }),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Calendar API error: ${res.status} ${err}`);
  }
  return await res.json();
}

async function deleteCalendarEvent(accessToken: string, eventId: string, calendarId = "primary") {
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(`Google Calendar delete error: ${res.status}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const user = await getUser(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (req.method === "POST" && path === "sync") {
      const accessToken = await getGoogleAccessToken();
      if (!accessToken) return errorResponse("Google Calendar not configured", 503);

      const { reunion_id } = await req.json();
      const supabase = createServiceClient();

      const { data: reunion, error } = await supabase
        .from("reuniones")
        .select("*, leads(nombre, empresa)")
        .eq("id", reunion_id)
        .single();
      if (error || !reunion) return errorResponse("Reunion not found", 404);

      const lead = Array.isArray(reunion.leads) ? reunion.leads[0] : reunion.leads;
      const summary = `Reunión: ${lead?.nombre ?? "Sin lead"}${lead?.empresa ? ` (${lead.empresa})` : ""}`;
      const startDate = new Date(reunion.fecha_hora);
      const endDate = new Date(startDate.getTime() + (reunion.duracion_min ?? 60) * 60_000);

      const event = await createCalendarEvent(accessToken, {
        summary,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        description: reunion.notas ?? "",
      });

      await supabase
        .from("reuniones")
        .update({ google_event_id: event.id })
        .eq("id", reunion_id);

      return jsonResponse({ google_event_id: event.id, htmlLink: event.htmlLink });
    }

    if (req.method === "DELETE" && path === "unsync") {
      const accessToken = await getGoogleAccessToken();
      if (!accessToken) return errorResponse("Google Calendar not configured", 503);

      const { reunion_id } = await req.json();
      const supabase = createServiceClient();

      const { data: reunion } = await supabase
        .from("reuniones")
        .select("google_event_id")
        .eq("id", reunion_id)
        .single();
      if (!reunion?.google_event_id) return errorResponse("No synced event", 404);

      await deleteCalendarEvent(accessToken, reunion.google_event_id);
      await supabase
        .from("reuniones")
        .update({ google_event_id: null })
        .eq("id", reunion_id);

      return jsonResponse({ ok: true });
    }

    return errorResponse("Not found", 404);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Internal error", 500);
  }
});
