export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
} as const;

export function corsResponse() {
  return new Response("ok", { headers: corsHeaders });
}

export function jsonResponse(
  data: unknown,
  init?: { status?: number; headers?: Record<string, string> }
) {
  return new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store, max-age=0",
      ...init?.headers,
    },
  });
}

export function errorResponse(message: string, status = 500) {
  return jsonResponse({ error: message }, { status });
}
