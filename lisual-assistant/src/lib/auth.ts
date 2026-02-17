import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, Role } from "@/types/auth";

/** Obtiene el perfil del usuario actual (incl. rol). Devuelve null si no hay sesión. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, additional_emails, phone_1, phone_2, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;
  return {
    ...profile,
    additional_emails: profile.additional_emails ?? [],
  } as Profile;
}

/** Exige sesión; redirige a /login si no hay usuario. Devuelve el perfil. */
export async function requireAuth(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

/** Exige un rol concreto (ej. 'admin'). Redirige a /dashboard si no lo tiene. */
export async function requireRole(allowedRoles: Role | Role[]): Promise<Profile> {
  const profile = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(profile.role)) redirect("/dashboard?error=forbidden");
  return profile;
}

/** Helper para comprobar si el usuario actual es admin (uso en Server Components). */
export async function isAdmin(): Promise<boolean> {
  const profile = await getProfile();
  return profile?.role === "admin";
}
