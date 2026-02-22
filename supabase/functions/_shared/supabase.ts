import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS.
 * Use only in cron, webhook, and agent tools.
 */
export function createServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key)
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  return createClient(url, key);
}

/**
 * User-scoped client — applies RLS based on the JWT in Authorization header.
 */
export function createUserClient(req: Request): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey)
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY required");

  return createClient(url, anonKey, {
    global: {
      headers: { Authorization: req.headers.get("Authorization") ?? "" },
    },
  });
}

/**
 * Extracts the authenticated user from the request's JWT.
 * Returns null if unauthenticated.
 */
export async function getUser(req: Request) {
  const client = createUserClient(req);
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const {
    data: { user },
  } = await client.auth.getUser(token);
  return user;
}
