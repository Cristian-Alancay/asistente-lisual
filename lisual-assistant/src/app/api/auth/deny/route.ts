import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cierra la sesión del usuario (no autorizado en allowlist) y redirige a login con error.
 * Usado por el middleware cuando ALLOWED_USER_EMAILS está definido y el email no está en la lista.
 */
export async function GET(request: NextRequest) {
  const redirectTo =
    request.nextUrl.searchParams.get("redirect") || "/login?error=denied";

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
