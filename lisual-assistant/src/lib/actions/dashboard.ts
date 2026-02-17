"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  const [leadsRes, presupuestosRes, clientesRes, instalacionesRes] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("estado", ["prospecto", "negociacion"]),
    supabase
      .from("presupuestos")
      .select("*", { count: "exact", head: true })
      .eq("estado", "enviado"),
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase
      .from("proyectos")
      .select("id", { count: "exact", head: true })
      .gte("fecha_instalacion_programada", new Date().toISOString().slice(0, 10))
      .lte("fecha_instalacion_programada", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
      .in("estado", ["programada", "en_proceso"]),
  ]);

  return {
    leadsActivos: leadsRes.count ?? 0,
    presupuestosPendientes: presupuestosRes.count ?? 0,
    clientesActivos: clientesRes.count ?? 0,
    instalacionesProgramadas: instalacionesRes.count ?? 0,
  };
}

export async function getLeadsNegociacion() {
  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, nombre, empresa, email, presupuestos(id, numero, total, estado)")
    .eq("estado", "negociacion")
    .order("updated_at", { ascending: false });
  if (error) throw error;

  const conPresupuestoEnviado = (leads ?? []).filter((l) => {
    const pres = l.presupuestos as { estado: string }[] | { estado: string } | null;
    const arr = Array.isArray(pres) ? pres : pres ? [pres] : [];
    return arr.some((p) => p.estado === "enviado");
  });
  return conPresupuestoEnviado;
}

export async function getSeguimientosDelDia() {
  const { getSeguimientosHoy } = await import("./planificacion");
  return getSeguimientosHoy();
}
