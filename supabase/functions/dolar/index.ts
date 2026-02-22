import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, corsResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/oficial", {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: "Error al obtener cotización", detail: text }),
        {
          status: res.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
          },
        }
      );
    }

    const data = (await res.json()) as { compra?: number; venta?: number };
    const venta = typeof data.venta === "number" ? data.venta : 0;
    const compra = typeof data.compra === "number" ? data.compra : 0;

    return new Response(JSON.stringify({ venta, compra }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  }
});
