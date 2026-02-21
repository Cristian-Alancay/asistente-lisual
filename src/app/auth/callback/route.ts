import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de OAuth (Google, Azure, Apple, etc.). Intercambia el code por sesión y redirige al dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard/elegir";
  if (!next.startsWith("/")) next = "/dashboard/elegir";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const base = isLocalEnv ? origin : forwardedHost ? `https://${forwardedHost}` : origin;
      const separator = next.includes("?") ? "&" : "?";
      const welcomeNext = `${next}${separator}welcome=1`;
      return NextResponse.redirect(`${base}${welcomeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
