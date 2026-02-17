"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const paths = ["/dashboard/planificacion", "/dashboard"];

export async function getTareasHoy() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const hoy = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("tareas")
    .select("*")
    .eq("usuario_id", user.id)
    .eq("fecha", hoy)
    .order("prioridad", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function crearTarea(titulo: string, fecha?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("tareas").insert({
    usuario_id: user.id,
    titulo,
    fecha: fecha ?? new Date().toISOString().split("T")[0],
  });
  if (error) throw error;
  paths.forEach((p) => revalidatePath(p));
}

export async function toggleTareaCompletada(id: string) {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("tareas")
    .select("completada")
    .eq("id", id)
    .single();
  if (!row) throw new Error("Tarea no encontrada");

  const { error } = await supabase
    .from("tareas")
    .update({ completada: !row.completada, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  paths.forEach((p) => revalidatePath(p));
}

export async function eliminarTarea(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tareas").delete().eq("id", id);
  if (error) throw error;
  paths.forEach((p) => revalidatePath(p));
}
