import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cacheHeaders } from "@/lib/api-headers";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401, headers: cacheHeaders.private() }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 100);
  const { data, error } = await supabase
    .from("chat_mensajes")
    .select("id, role, content, created_at")
    .eq("usuario_id", user.id)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: cacheHeaders.private() }
    );
  }
  return NextResponse.json(data ?? [], {
    headers: cacheHeaders.private(),
  });
}
