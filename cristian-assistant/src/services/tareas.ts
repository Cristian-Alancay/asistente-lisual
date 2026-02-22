import { supabase } from "@/lib/supabase";

export async function getTareasHoy() {
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("tareas").insert({
    usuario_id: user.id,
    titulo,
    fecha: fecha ?? new Date().toISOString().split("T")[0],
  });
  if (error) throw error;
}

export async function toggleTareaCompletada(id: string) {
  const { data: row } = await supabase
    .from("tareas")
    .select("completada")
    .eq("id", id)
    .single();
  if (!row) throw new Error("Tarea no encontrada");

  const { error } = await supabase
    .from("tareas")
    .update({ completada: !row.completada })
    .eq("id", id);
  if (error) throw error;
}

export async function eliminarTarea(id: string) {
  const { error } = await supabase.from("tareas").delete().eq("id", id);
  if (error) throw error;
}
