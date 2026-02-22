import { supabase } from "@/lib/supabase";
import type { ReunionHoy } from "@/types/entities";
import { getSeguimientosPendientes } from "./seguimientos";

export async function getReunionesHoy(): Promise<ReunionHoy[]> {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();
  const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1).toISOString();

  const { data, error } = await supabase
    .from("reuniones")
    .select("id, lead_id, fecha_hora, duracion_min, notas, leads(nombre, empresa)")
    .gte("fecha_hora", inicio)
    .lt("fecha_hora", fin)
    .order("fecha_hora");
  if (error) throw error;

  return (data ?? []).map((r) => ({
    ...r,
    leads: Array.isArray(r.leads) ? r.leads[0] : r.leads,
  }));
}

export async function getSeguimientosHoy() {
  const todos = await getSeguimientosPendientes();
  const hoy = new Date().toISOString().split("T")[0];
  return todos.filter((s) => s.programado_para.startsWith(hoy));
}
