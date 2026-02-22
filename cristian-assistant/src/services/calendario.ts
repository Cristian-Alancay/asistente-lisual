import { supabase } from "@/lib/supabase";
import type { EventoCalendario } from "@/types/entities";

export async function getEventosMes(ano: number, mes: number): Promise<EventoCalendario[]> {
  const inicio = new Date(ano, mes - 1, 1);
  const fin = new Date(ano, mes, 0, 23, 59, 59);
  const inicioStr = inicio.toISOString();
  const finStr = fin.toISOString();
  const inicioDate = inicio.toISOString().split("T")[0];
  const finDate = fin.toISOString().split("T")[0];

  const eventos: EventoCalendario[] = [];

  const [reunionesRes, proyectosRes, seguimientosRes, revisionesRes, solicitudesRes] =
    await Promise.all([
      supabase
        .from("reuniones")
        .select("id, fecha_hora, leads(nombre)")
        .gte("fecha_hora", inicioStr)
        .lte("fecha_hora", finStr),
      supabase
        .from("proyectos")
        .select("id, nombre, fecha_instalacion_programada")
        .gte("fecha_instalacion_programada", inicioDate)
        .lte("fecha_instalacion_programada", finDate)
        .not("fecha_instalacion_programada", "is", null),
      supabase
        .from("seguimientos")
        .select("id, programado_para, tipo")
        .gte("programado_para", inicioStr)
        .lte("programado_para", finStr),
      supabase
        .from("revisiones")
        .select("id, programada_para, tipo")
        .gte("programada_para", inicioDate)
        .lte("programada_para", finDate),
      supabase
        .from("solicitudes_video")
        .select("id, fecha_hora_video")
        .gte("fecha_hora_video", inicioStr)
        .lte("fecha_hora_video", finStr),
    ]);

  for (const r of reunionesRes.data ?? []) {
    const lead = Array.isArray(r.leads) ? r.leads[0] : r.leads;
    eventos.push({
      id: r.id,
      tipo: "reunion",
      titulo: `Reunion: ${(lead as { nombre?: string } | null)?.nombre ?? "Lead"}`,
      fecha: r.fecha_hora.split("T")[0],
      fechaHora: r.fecha_hora,
      detalle: r.fecha_hora,
    });
  }
  for (const p of proyectosRes.data ?? []) {
    if (p.fecha_instalacion_programada) {
      eventos.push({
        id: p.id,
        tipo: "instalacion",
        titulo: `Instalacion: ${p.nombre}`,
        fecha: p.fecha_instalacion_programada,
        detalle: p.fecha_instalacion_programada,
      });
    }
  }
  for (const s of seguimientosRes.data ?? []) {
    eventos.push({
      id: s.id,
      tipo: "seguimiento",
      titulo: `Seguimiento ${s.tipo}`,
      fecha: s.programado_para.split("T")[0],
      fechaHora: s.programado_para,
    });
  }
  for (const r of revisionesRes.data ?? []) {
    eventos.push({
      id: r.id,
      tipo: "revision",
      titulo: `Revision ${r.tipo}`,
      fecha: r.programada_para,
    });
  }
  for (const s of solicitudesRes.data ?? []) {
    eventos.push({
      id: s.id,
      tipo: "solicitud_video",
      titulo: "Video solicitado",
      fecha: s.fecha_hora_video.split("T")[0],
      fechaHora: s.fecha_hora_video,
    });
  }

  return eventos.sort((a, b) => (a.fechaHora ?? a.fecha).localeCompare(b.fechaHora ?? b.fecha));
}
