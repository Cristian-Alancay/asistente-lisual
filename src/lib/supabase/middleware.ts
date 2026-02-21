import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminOnlyPath } from "@/types/auth";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");
  const isDashboard =
    pathname.startsWith("/dashboard") || pathname === "/";

  // APIs públicas: no exigen sesión (dolar, webhooks externos, auth, cron con CRON_SECRET)
  const isPublicApi =
    pathname === "/api/dolar-oficial" ||
    pathname.startsWith("/api/webhook/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/cron/");

  if (pathname.startsWith("/api/") && !isPublicApi && !user) {
    return NextResponse.json(
      { error: "No autenticado" },
      {
        status: 401,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      }
    );
  }

  if (!user && isDashboard) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/elegir";
    return NextResponse.redirect(url);
  }

  // Registro eliminado: solo 2 usuarios autorizados. /register → /login
  if (pathname.startsWith("/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allowlist: solo los correos autorizados pueden acceder (Cristian Alancay, Eliana Corraro)
  const allowedEmailsRaw = process.env.ALLOWED_USER_EMAILS;
  if (user && allowedEmailsRaw && !pathname.startsWith("/api/auth/deny")) {
    const allowed = allowedEmailsRaw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const userEmail = user.email?.toLowerCase();
    if (allowed.length > 0 && userEmail && !allowed.includes(userEmail)) {
      const url = request.nextUrl.clone();
      url.pathname = "/api/auth/deny";
      url.searchParams.set("redirect", "/login?error=denied");
      return NextResponse.redirect(url);
    }
  }

  // Rutas solo admin: comprobar rol
  if (user && isAdminOnlyPath(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }
  }

  // /dashboard/personal: solo miembros del user_manager "default" (Cristian Alancay)
  if (user && pathname.startsWith("/dashboard/personal")) {
    const { data: um } = await supabase
      .from("user_manager")
      .select("id")
      .eq("slug", "default")
      .limit(1)
      .single();

    if (um?.id) {
      const { data: member } = await supabase
        .from("user_manager_members")
        .select("user_id")
        .eq("user_manager_id", um.id)
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!member) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        url.searchParams.set("error", "personal-forbidden");
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
