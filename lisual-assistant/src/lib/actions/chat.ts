"use server";

import { createClient } from "@/lib/supabase/server";

export async function getChatHistory(limit = 50) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("chat_mensajes")
    .select("id, role, content, created_at")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function saveChatMessage(role: "user" | "assistant", content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("chat_mensajes").insert({
    usuario_id: user.id,
    role,
    content,
  });
}
