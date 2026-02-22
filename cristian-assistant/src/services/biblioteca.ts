import { supabase } from "@/lib/supabase";

export interface CasoExito {
  id: string;
  nombre_proyecto: string;
  empresa: string;
  pais: string;
  ciudad: string | null;
  tipo_proyecto: string;
  tamano_obra: string | null;
  duracion_estimada: string | null;
  perfil_cliente: string;
  etapa_cliente: string | null;
  nivel_presupuesto: string | null;
  problemas: string[];
  soluciones: string[];
  resultados: string[];
  metricas: Record<string, string | number> | null;
  link_instagram: string | null;
  link_reel: string | null;
  link_post: string | null;
  link_drive: string | null;
  link_timelapse: string | null;
  imagen_url: string | null;
  objecion_responde: string | null;
  frase_gancho: string | null;
  mensaje_whatsapp: string | null;
  script_reunion: string | null;
  momento_ideal: string | null;
  destacado: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export type CasoExitoInsert = Omit<CasoExito, "id" | "created_at" | "updated_at"> &
  Partial<Pick<CasoExito, "id" | "created_at" | "updated_at">>;

export type CasoExitoUpdate = Partial<Omit<CasoExito, "id" | "created_at">>;

export async function getCasosExito(): Promise<CasoExito[]> {
  const { data, error } = await supabase
    .from("casos_exito")
    .select("*")
    .eq("activo", true)
    .order("destacado", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CasoExito[];
}

export async function getCasoExitoById(id: string): Promise<CasoExito | null> {
  const { data, error } = await supabase
    .from("casos_exito")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as CasoExito | null;
}

export async function createCasoExito(caso: CasoExitoInsert): Promise<CasoExito> {
  const { data, error } = await supabase
    .from("casos_exito")
    .insert(caso)
    .select()
    .single();

  if (error) throw error;
  return data as CasoExito;
}

export async function updateCasoExito(id: string, updates: CasoExitoUpdate): Promise<CasoExito> {
  const { data, error } = await supabase
    .from("casos_exito")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as CasoExito;
}

export async function deleteCasoExito(id: string): Promise<void> {
  const { error } = await supabase
    .from("casos_exito")
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
