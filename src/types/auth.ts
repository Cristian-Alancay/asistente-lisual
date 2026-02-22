/** Roles del sistema. admin: acceso total y configuracion; usuario: uso normal; viewer: solo lectura */
export type Role = "admin" | "usuario" | "viewer";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  additional_emails: string[];
  phone_1: string | null;
  phone_2: string | null;
  created_at: string;
  updated_at: string;
};

export const ADMIN_ONLY_PATHS = ["/dashboard/configuracion"] as const;

export function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
}
