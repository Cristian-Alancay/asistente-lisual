"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_VALUES,
  type PersonalConfig,
  type PersonalConfigKey,
} from "@/lib/config-personal-defaults";

const CONTEXTO_PERSONAL = "personal";
const CONFIG_PATH = "/dashboard/personal/configuracion";

/** Obtiene la configuración personal (contexto 'personal') como objeto clave-valor */
export async function getPersonalConfig(): Promise<Partial<PersonalConfig>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_config")
    .select("key, value")
    .eq("contexto", CONTEXTO_PERSONAL);
  if (error) throw error;
  const out: Partial<PersonalConfig> = {};
  for (const row of data ?? []) {
    const k = row.key as PersonalConfigKey;
    if (Object.prototype.hasOwnProperty.call(DEFAULT_VALUES, k)) {
      out[k] = row.value ?? DEFAULT_VALUES[k];
    }
  }
  return out;
}

/** Guarda un valor de configuración personal */
export async function setPersonalConfigKey(
  key: PersonalConfigKey,
  value: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("app_config")
    .upsert(
      {
        contexto: CONTEXTO_PERSONAL,
        key,
        value: value.trim() || null,
      },
      { onConflict: "contexto,key" }
    );
  if (error) throw error;
  revalidatePath(CONFIG_PATH);
}

/** Guarda varios valores de configuración personal */
export async function setPersonalConfig(
  values: Partial<PersonalConfig>
): Promise<void> {
  const supabase = await createClient();
  const rows = Object.entries(values).map(([key, value]) => ({
    contexto: CONTEXTO_PERSONAL,
    key,
    value: value?.trim() ?? null,
  }));
  if (rows.length === 0) return;
  const { error } = await supabase.from("app_config").upsert(rows, {
    onConflict: "contexto,key",
  });
  if (error) throw error;
  revalidatePath(CONFIG_PATH);
}
