import { supabase } from "@/lib/supabase";
import type { PersonalTarea, PersonalEvento, PersonalNota, ProximosPersonales } from "@/types/entities";

async function getDefaultUserManagerId(): Promise<string> {
  const { data, error } = await supabase
    .from("user_manager")
    .select("id")
    .eq("slug", "default")
    .limit(1)
    .single();
  if (error || !data) throw new Error("User manager no encontrado");
  return data.id as string;
}

// --- Tareas ---

export async function getPersonalTareas(fecha?: string): Promise<PersonalTarea[]> {
  const umId = await getDefaultUserManagerId();
  let q = supabase
    .from("personal_tareas")
    .select("*")
    .eq("user_manager_id", umId)
    .order("completada", { ascending: true })
    .order("created_at", { ascending: true });
  if (fecha) q = q.eq("fecha", fecha);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as PersonalTarea[];
}

export async function crearPersonalTarea(titulo: string, fecha?: string) {
  const umId = await getDefaultUserManagerId();
  const { error } = await supabase.from("personal_tareas").insert({
    user_manager_id: umId,
    titulo: titulo.trim(),
    fecha: fecha ?? new Date().toISOString().split("T")[0],
  });
  if (error) throw error;
}

export async function togglePersonalTareaCompletada(id: string) {
  const { data: row } = await supabase
    .from("personal_tareas")
    .select("completada")
    .eq("id", id)
    .single();
  if (!row) throw new Error("Tarea no encontrada");
  const { error } = await supabase
    .from("personal_tareas")
    .update({ completada: !row.completada })
    .eq("id", id);
  if (error) throw error;
}

export async function eliminarPersonalTarea(id: string) {
  const { error } = await supabase.from("personal_tareas").delete().eq("id", id);
  if (error) throw error;
}

// --- Eventos ---

export async function getEventosPersonalesMes(ano: number, mes: number): Promise<PersonalEvento[]> {
  const umId = await getDefaultUserManagerId();
  const inicio = new Date(ano, mes - 1, 1);
  const fin = new Date(ano, mes, 0, 23, 59, 59);
  const { data, error } = await supabase
    .from("personal_eventos")
    .select("*")
    .eq("user_manager_id", umId)
    .or(`fecha_inicio.lte.${fin.toISOString()},fecha_fin.gte.${inicio.toISOString()}`)
    .order("fecha_inicio", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PersonalEvento[];
}

export async function crearPersonalEvento(params: {
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion?: string;
}) {
  const umId = await getDefaultUserManagerId();
  const { error } = await supabase.from("personal_eventos").insert({
    user_manager_id: umId,
    titulo: params.titulo.trim(),
    fecha_inicio: params.fecha_inicio,
    fecha_fin: params.fecha_fin,
    descripcion: params.descripcion?.trim() || null,
  });
  if (error) throw error;
}

export async function actualizarPersonalEvento(
  id: string,
  params: { titulo?: string; fecha_inicio?: string; fecha_fin?: string; descripcion?: string }
) {
  const updates: Record<string, unknown> = {};
  if (params.titulo !== undefined) updates.titulo = params.titulo.trim();
  if (params.fecha_inicio !== undefined) updates.fecha_inicio = params.fecha_inicio;
  if (params.fecha_fin !== undefined) updates.fecha_fin = params.fecha_fin;
  if (params.descripcion !== undefined) updates.descripcion = params.descripcion?.trim() || null;
  const { error } = await supabase.from("personal_eventos").update(updates).eq("id", id);
  if (error) throw error;
}

export async function eliminarPersonalEvento(id: string) {
  const { error } = await supabase.from("personal_eventos").delete().eq("id", id);
  if (error) throw error;
}

// --- Notas ---

export async function getPersonalNotas(): Promise<PersonalNota[]> {
  const umId = await getDefaultUserManagerId();
  const { data, error } = await supabase
    .from("personal_notas")
    .select("*")
    .eq("user_manager_id", umId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PersonalNota[];
}

export async function crearPersonalNota(titulo: string, contenido?: string) {
  const umId = await getDefaultUserManagerId();
  const { error } = await supabase.from("personal_notas").insert({
    user_manager_id: umId,
    titulo: titulo.trim(),
    contenido: contenido?.trim() || null,
  });
  if (error) throw error;
}

export async function actualizarPersonalNota(id: string, titulo: string, contenido?: string) {
  const { error } = await supabase
    .from("personal_notas")
    .update({ titulo: titulo.trim(), contenido: contenido?.trim() ?? null })
    .eq("id", id);
  if (error) throw error;
}

export async function eliminarPersonalNota(id: string) {
  const { error } = await supabase.from("personal_notas").delete().eq("id", id);
  if (error) throw error;
}

// --- Proximos ---

export async function getProximosPersonales(): Promise<ProximosPersonales> {
  const umId = await getDefaultUserManagerId();
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 7);

  const [tareasRes, eventosRes] = await Promise.all([
    supabase
      .from("personal_tareas")
      .select("*")
      .eq("user_manager_id", umId)
      .eq("completada", false)
      .order("fecha", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })
      .limit(10),
    supabase
      .from("personal_eventos")
      .select("*")
      .eq("user_manager_id", umId)
      .gte("fecha_inicio", now.toISOString())
      .lte("fecha_inicio", in7.toISOString())
      .order("fecha_inicio", { ascending: true })
      .limit(5),
  ]);

  return {
    tareasPendientes: (tareasRes.data ?? []) as PersonalTarea[],
    eventosProximos: (eventosRes.data ?? []) as PersonalEvento[],
  };
}
