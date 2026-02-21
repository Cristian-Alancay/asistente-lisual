"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const PERSONAL_PATHS = ["/dashboard/personal", "/dashboard/personal/tareas", "/dashboard/personal/calendario", "/dashboard/personal/notas"];

async function getDefaultUserManagerId() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_manager")
    .select("id")
    .eq("slug", "default")
    .limit(1)
    .single();
  if (error || !data) throw new Error("User manager no encontrado");
  return data.id as string;
}

// --- Personal Tareas ---

export type PersonalTarea = {
  id: string;
  user_manager_id: string;
  titulo: string;
  completada: boolean;
  prioridad: string | null;
  fecha: string | null;
  created_at: string;
  updated_at: string;
};

export async function getPersonalTareas(fecha?: string) {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const umId = await getDefaultUserManagerId();
  const { error } = await supabase.from("personal_tareas").insert({
    user_manager_id: umId,
    titulo: titulo.trim(),
    fecha: fecha ?? new Date().toISOString().split("T")[0],
  });
  if (error) throw error;
  PERSONAL_PATHS.forEach((p) => revalidatePath(p));
}

export async function togglePersonalTareaCompletada(id: string) {
  const supabase = await createClient();
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
  PERSONAL_PATHS.forEach((p) => revalidatePath(p));
}

export async function eliminarPersonalTarea(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("personal_tareas").delete().eq("id", id);
  if (error) throw error;
  PERSONAL_PATHS.forEach((p) => revalidatePath(p));
}

// --- Personal Eventos ---

export type PersonalEvento = {
  id: string;
  user_manager_id: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
};

export async function getEventosPersonalesMes(ano: number, mes: number) {
  const supabase = await createClient();
  const umId = await getDefaultUserManagerId();
  const inicio = new Date(ano, mes - 1, 1);
  const fin = new Date(ano, mes, 0, 23, 59, 59);
  const inicioStr = inicio.toISOString();
  const finStr = fin.toISOString();
  const { data, error } = await supabase
    .from("personal_eventos")
    .select("*")
    .eq("user_manager_id", umId)
    .or(`fecha_inicio.lte.${finStr},fecha_fin.gte.${inicioStr}`)
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
  const supabase = await createClient();
  const umId = await getDefaultUserManagerId();
  const { error } = await supabase.from("personal_eventos").insert({
    user_manager_id: umId,
    titulo: params.titulo.trim(),
    fecha_inicio: params.fecha_inicio,
    fecha_fin: params.fecha_fin,
    descripcion: params.descripcion?.trim() || null,
  });
  if (error) throw error;
  PERSONAL_PATHS.forEach((p) => revalidatePath(p));
}

export async function actualizarPersonalEvento(
  id: string,
  params: { titulo?: string; fecha_inicio?: string; fecha_fin?: string; descripcion?: string }
) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  if (params.titulo !== undefined) updates.titulo = params.titulo.trim();
  if (params.fecha_inicio !== undefined) updates.fecha_inicio = params.fecha_inicio;
  if (params.fecha_fin !== undefined) updates.fecha_fin = params.fecha_fin;
  if (params.descripcion !== undefined) updates.descripcion = params.descripcion?.trim() || null;
  const { error } = await supabase.from("personal_eventos").update(updates).eq("id", id);
  if (error) throw error;
  PERSONAL_PATHS.forEach((p) => revalidatePath(p));
}

export async function eliminarPersonalEvento(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("personal_eventos").delete().eq("id", id);
  if (error) throw error;
  PERSONAL_PATHS.forEach((p) => revalidatePath(p));
}

// --- Personal Notas ---

export type PersonalNota = {
  id: string;
  user_manager_id: string;
  titulo: string;
  contenido: string | null;
  created_at: string;
  updated_at: string;
};

export async function getPersonalNotas() {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const umId = await getDefaultUserManagerId();
  const { error } = await supabase.from("personal_notas").insert({
    user_manager_id: umId,
    titulo: titulo.trim(),
    contenido: contenido?.trim() || null,
  });
  if (error) throw error;
  PERSONAL_PATHS.forEach((p) => revalidatePath(p));
}

export async function actualizarPersonalNota(id: string, titulo: string, contenido?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("personal_notas")
    .update({
      titulo: titulo.trim(),
      contenido: contenido?.trim() ?? null,
    })
    .eq("id", id);
  if (error) throw error;
  PERSONAL_PATHS.forEach((p) => revalidatePath(p));
}

export async function eliminarPersonalNota(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("personal_notas").delete().eq("id", id);
  if (error) throw error;
  PERSONAL_PATHS.forEach((p) => revalidatePath(p));
}

// --- Recordatorios / Próximos (Fase 4 opcional) ---

export type ProximosPersonales = {
  tareasPendientes: PersonalTarea[];
  eventosProximos: PersonalEvento[];
};

/** Tareas no completadas y eventos en los próximos 7 días para el bloque Recordatorios */
export async function getProximosPersonales(): Promise<ProximosPersonales> {
  const supabase = await createClient();
  const umId = await getDefaultUserManagerId();
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 7);
  const nowStr = now.toISOString();
  const in7Str = in7.toISOString();

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
      .gte("fecha_inicio", nowStr)
      .lte("fecha_inicio", in7Str)
      .order("fecha_inicio", { ascending: true })
      .limit(5),
  ]);

  return {
    tareasPendientes: (tareasRes.data ?? []) as PersonalTarea[],
    eventosProximos: (eventosRes.data ?? []) as PersonalEvento[],
  };
}
