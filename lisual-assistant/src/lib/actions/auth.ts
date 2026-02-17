"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UpdateProfileInput = {
  full_name: string | null;
  /** Correos adicionales (separados por coma o uno por línea). El principal es el de login. */
  additional_emails_raw?: string;
  phone_1: string | null;
  phone_2: string | null;
};

function parseAdditionalEmails(raw: string | undefined): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/[\n,]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes("@"));
}

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No hay sesión" };

  const additional_emails = parseAdditionalEmails(input.additional_emails_raw);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name || null,
      additional_emails: additional_emails,
      phone_1: input.phone_1?.trim() || null,
      phone_2: input.phone_2?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return {};
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
