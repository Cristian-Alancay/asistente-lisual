"use server";

import { createClient } from "@/lib/supabase/server";

export type Notificacion = {
  id: string;
  tipo: "seguimiento" | "presupuesto_vencimiento" | "instalacion" | "revision";
  titulo: string;
  descripcion?: string;
  href: string;
  fecha?: string;
};

export async function getNotificaciones(limit = 10): Promise<Notificacion[]> {
  const supabase = await createClient();
  const hoy = new Date().toISOString().slice(0, 10);
  const en7Dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [seguimientosRes, presupuestosRes, instalacionesRes, revisionesRes] = await Promise.all([
    supabase
      .from("seguimientos")
      .select("id, programado_para, presupuestos(leads(nombre)), tipo")
      .is("ejecutado_at", null)
      .lte("programado_para", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .order("programado_para", { ascending: true })
      .limit(5),
    supabase
      .from("presupuestos")
      .select("id, numero, vigencia_hasta, leads(nombre)")
      .eq("estado", "enviado")
      .lte("vigencia_hasta", en7Dias)
      .gte("vigencia_hasta", hoy)
      .order("vigencia_hasta", { ascending: true })
      .limit(5),
    supabase
      .from("proyectos")
      .select("id, nombre, fecha_instalacion_programada")
      .gte("fecha_instalacion_programada", hoy)
      .lte("fecha_instalacion_programada", en7Dias)
      .in("estado", ["programada", "en_proceso"])
      .order("fecha_instalacion_programada", { ascending: true })
      .limit(5),
    supabase
      .from("revisiones")
      .select("id, programada_para, tipo, clientes(leads(nombre))")
      .is("realizada_at", null)
      .gte("programada_para", hoy)
      .lte("programada_para", en7Dias)
      .order("programada_para", { ascending: true })
      .limit(5),
  ]);

  const items: Notificacion[] = [];

  for (const s of seguimientosRes.data ?? []) {
    const pres = s.presupuestos as { leads?: { nombre?: string } | null } | null;
    const nombre = pres?.leads?.nombre;
    items.push({
      id: `seg-${s.id}`,
      tipo: "seguimiento",
      titulo: `Seguimiento ${s.tipo} pendiente`,
      descripcion: nombre ? `Lead: ${nombre}` : undefined,
      href: "/dashboard/planificacion",
      fecha: s.programado_para,
    });
  }

  for (const p of presupuestosRes.data ?? []) {
    const lead = (p.leads as { nombre?: string } | null);
    items.push({
      id: `pres-${p.id}`,
      tipo: "presupuesto_vencimiento",
      titulo: `Presupuesto ${p.numero} vence pronto`,
      descripcion: lead?.nombre ? `Lead: ${lead.nombre}` : `Vence: ${p.vigencia_hasta}`,
      href: "/dashboard/presupuestos",
      fecha: p.vigencia_hasta,
    });
  }

  for (const i of instalacionesRes.data ?? []) {
    items.push({
      id: `inst-${i.id}`,
      tipo: "instalacion",
      titulo: `Instalación: ${i.nombre ?? "Proyecto"}`,
      descripcion: `Programada: ${i.fecha_instalacion_programada}`,
      href: "/dashboard/operaciones",
      fecha: i.fecha_instalacion_programada ?? undefined,
    });
  }

  for (const r of revisionesRes.data ?? []) {
    const cli = r.clientes as { leads?: { nombre?: string } | null } | null;
    const nombre = cli?.leads?.nombre;
    items.push({
      id: `rev-${r.id}`,
      tipo: "revision",
      titulo: `Revisión ${r.tipo} pendiente`,
      descripcion: nombre ? `Cliente: ${nombre}` : undefined,
      href: "/dashboard/experiencia",
      fecha: r.programada_para,
    });
  }

  return items.slice(0, limit);
}

/** Resumen para alertas proactivas: contadores por tipo y cuántos son "hoy" */
export type ResumenAlertasProactivas = {
  total: number;
  seguimientos: number;
  seguimientosHoy: number;
  presupuestosVencen: number;
  presupuestosVencenHoy: number;
  instalaciones: number;
  revisiones: number;
};

export async function getResumenAlertasProactivas(): Promise<ResumenAlertasProactivas> {
  const items = await getNotificaciones(30);
  const hoy = new Date().toISOString().slice(0, 10);

  let seguimientos = 0;
  let seguimientosHoy = 0;
  let presupuestosVencen = 0;
  let presupuestosVencenHoy = 0;
  let instalaciones = 0;
  let revisiones = 0;

  for (const n of items) {
    const esHoy = n.fecha?.slice(0, 10) === hoy;
    switch (n.tipo) {
      case "seguimiento":
        seguimientos++;
        if (esHoy) seguimientosHoy++;
        break;
      case "presupuesto_vencimiento":
        presupuestosVencen++;
        if (esHoy) presupuestosVencenHoy++;
        break;
      case "instalacion":
        instalaciones++;
        break;
      case "revision":
        revisiones++;
        break;
    }
  }

  return {
    total: items.length,
    seguimientos,
    seguimientosHoy,
    presupuestosVencen,
    presupuestosVencenHoy,
    instalaciones,
    revisiones,
  };
}
