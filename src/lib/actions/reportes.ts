"use server";

import { createClient } from "@/lib/supabase/server";

export type ReporteVentas = {
  leadsPorEstado: { estado: string; count: number }[];
  leadsPorCanal: { canal: string; count: number }[];
  presupuestosPorEstado: { estado: string; count: number }[];
  totalPresupuestosAceptados: number;
  montoTotalAceptado: number;
};

export type ReporteOperaciones = {
  proyectosPorEstado: { estado: string; count: number }[];
  instalacionesProximas7Dias: number;
  equiposEnStock: number;
};

export type ReporteExperiencia = {
  solicitudesVideoPendientes: number;
  revisionesPendientes: number;
  referenciasTotal: number;
};

export async function getReporteVentas(filtro?: {
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<ReporteVentas> {
  const supabase = await createClient();

  let leadsQ = supabase.from("leads").select("estado, canal_origen, created_at");
  let presupuestosQ = supabase.from("presupuestos").select("estado, total, created_at");

  if (filtro?.fechaDesde) {
    leadsQ = leadsQ.gte("created_at", filtro.fechaDesde);
    presupuestosQ = presupuestosQ.gte("created_at", filtro.fechaDesde);
  }
  if (filtro?.fechaHasta) {
    const hasta = new Date(filtro.fechaHasta);
    hasta.setHours(23, 59, 59, 999);
    leadsQ = leadsQ.lte("created_at", hasta.toISOString());
    presupuestosQ = presupuestosQ.lte("created_at", hasta.toISOString());
  }

  const [leadsRes, presupuestosRes] = await Promise.all([leadsQ, presupuestosQ]);

  const leads = leadsRes.data ?? [];
  const presupuestos = presupuestosRes.data ?? [];

  const porEstado = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.estado] = (acc[l.estado] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([estado, count]) => ({ estado, count }));

  const porCanal = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.canal_origen] = (acc[l.canal_origen] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([canal, count]) => ({ canal, count }));

  const presupuestosPorEstado = Object.entries(
    presupuestos.reduce<Record<string, number>>((acc, p) => {
      acc[p.estado] = (acc[p.estado] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([estado, count]) => ({ estado, count }));

  const aceptados = presupuestos.filter((p) => p.estado === "aceptado");
  const montoTotal = aceptados.reduce((sum, p) => sum + Number(p.total ?? 0), 0);

  return {
    leadsPorEstado: porEstado,
    leadsPorCanal: porCanal,
    presupuestosPorEstado: presupuestosPorEstado,
    totalPresupuestosAceptados: aceptados.length,
    montoTotalAceptado: montoTotal,
  };
}

export async function getReporteOperaciones(): Promise<ReporteOperaciones> {
  const supabase = await createClient();

  const hoy = new Date().toISOString().slice(0, 10);
  const en7Dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [proyectosRes, proyectosProxRes, activosRes] = await Promise.all([
    supabase.from("proyectos").select("estado"),
    supabase
      .from("proyectos")
      .select("id", { count: "exact", head: true })
      .gte("fecha_instalacion_programada", hoy)
      .lte("fecha_instalacion_programada", en7Dias)
      .in("estado", ["programada", "en_proceso"]),
    supabase.from("activos").select("id", { count: "exact", head: true }).eq("estado", "en_stock"),
  ]);

  const proyectos = proyectosRes.data ?? [];
  const porEstado = Object.entries(
    proyectos.reduce<Record<string, number>>((acc, p) => {
      acc[p.estado] = (acc[p.estado] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([estado, count]) => ({ estado, count }));

  return {
    proyectosPorEstado: porEstado,
    instalacionesProximas7Dias: proyectosProxRes.count ?? 0,
    equiposEnStock: activosRes.count ?? 0,
  };
}

export async function getReporteExperiencia(): Promise<ReporteExperiencia> {
  const supabase = await createClient();

  const [solicitudesRes, revisionesRes, referenciasRes] = await Promise.all([
    supabase.from("solicitudes_video").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
    supabase.from("revisiones").select("id", { count: "exact", head: true }).is("realizada_at", null),
    supabase.from("referencias").select("id", { count: "exact", head: true }),
  ]);

  return {
    solicitudesVideoPendientes: solicitudesRes.count ?? 0,
    revisionesPendientes: revisionesRes.count ?? 0,
    referenciasTotal: referenciasRes.count ?? 0,
  };
}
