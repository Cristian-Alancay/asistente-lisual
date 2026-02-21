import { createClient } from "@/lib/supabase/server";
import { requireCanEdit } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Wraps a mutation server action with:
 * 1. Permission check (requireCanEdit)
 * 2. Supabase client creation
 * 3. Path revalidation after success
 *
 * Eliminates the repeated boilerplate in every mutating action.
 */
export async function withEditAuth<T>(
  paths: string[],
  fn: (ctx: { supabase: SupabaseClient }) => Promise<T>
): Promise<T> {
  const check = await requireCanEdit();
  if (check.error) throw new Error(check.error);
  const supabase = await createClient();
  const result = await fn({ supabase });
  paths.forEach((p) => revalidatePath(p));
  return result;
}
