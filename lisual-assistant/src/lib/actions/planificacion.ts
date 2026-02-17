"use server";

import { createClient } from "@/lib/supabase/server";
import { getSeguimientosPendientes } from "./seguimientos";

export type ReunionHoy = {
  id: string;
  lead_id: string;
  fecha_hora: string;
  duracion_min: number | null;
  notas: string | null;
  leads?: { nombre: string; empresa: string | null } | null;
};

export async function getReunionesHoy(): Promise<ReunionHoy[]> {
  const supabase = await createClient();
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
