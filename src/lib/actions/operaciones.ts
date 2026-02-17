"use server";

import { createClient } from "@/lib/supabase/server";
import { requireCanEdit } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const paths = ["/dashboard", "/dashboard/operaciones", "/dashboard/instalaciones"];

export async function getProyectos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proyectos")
    .select(`
      *,
      clientes (
        id,
        lead_id,
        leads (nombre, empresa, email)
      )
    `)
    .order("fecha_instalacion_programada", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function getProyecto(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proyectos")
    .select(`
      *,
      clientes (
        id,
        lead_id,
        id_lisual_pro,
        id_empresa,
        leads (nombre, empresa, email, telefono)
      )
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getClientes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, lead_id, id_lisual_pro, id_empresa, leads(nombre, empresa)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProyecto(form: {
  cliente_id: string;
  nombre: string;
  direccion?: string;
  contacto_sitio?: string;
  telefono_sitio?: string;
  fecha_instalacion_programada?: string;
}) {
  const check = await requireCanEdit();
  if (check.error) throw new Error(check.error);
  const supabase = await createClient();
  const { error } = await supabase.from("proyectos").insert({
    cliente_id: form.cliente_id,
    nombre: form.nombre,
    direccion: form.direccion || null,
    contacto_sitio: form.contacto_sitio || null,
    telefono_sitio: form.telefono_sitio || null,
    fecha_instalacion_programada: form.fecha_instalacion_programada || null,
    estado: form.fecha_instalacion_programada ? "programada" : "pendiente",
  });
  if (error) throw error;
  paths.forEach((p) => revalidatePath(p));
}

export async function updateProyecto(
  id: string,
  form: Partial<{
    nombre: string;
    direccion: string;
    contacto_sitio: string;
    telefono_sitio: string;
    fecha_instalacion_programada: string;
    estado: string;
  }>
) {
  const check = await requireCanEdit();
  if (check.error) throw new Error(check.error);
  const supabase = await createClient();
  const { error } = await supabase
    .from("proyectos")
    .update({ ...form, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  paths.forEach((p) => revalidatePath(p));
}

export async function getActivos(proyectoId?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("activos")
    .select("*, proyectos(nombre)")
    .order("created_at", { ascending: false });
  if (proyectoId) q = q.eq("proyecto_id", proyectoId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createActivo(form: {
  proyecto_id?: string;
  tipo: "camara" | "chip" | "teleport";
  codigo: string;
  numero_serie?: string;
  iccid?: string;
  numero_telefono?: string;
  estado?: string;
}) {
  const check = await requireCanEdit();
  if (check.error) throw new Error(check.error);
  const supabase = await createClient();
  const { error } = await supabase.from("activos").insert({
    proyecto_id: form.proyecto_id || null,
    tipo: form.tipo,
    codigo: form.codigo,
    numero_serie: form.numero_serie || null,
    iccid: form.iccid || null,
    numero_telefono: form.numero_telefono || null,
    estado: form.proyecto_id ? "asignado" : form.estado || "en_stock",
  });
  if (error) throw error;
  paths.forEach((p) => revalidatePath(p));
}

export async function asignarActivoAProyecto(activoId: string, proyectoId: string) {
  const check = await requireCanEdit();
  if (check.error) throw new Error(check.error);
  const supabase = await createClient();
  const { error } = await supabase
    .from("activos")
    .update({ proyecto_id: proyectoId, estado: "asignado", updated_at: new Date().toISOString() })
    .eq("id", activoId);
  if (error) throw error;
  paths.forEach((p) => revalidatePath(p));
}

export async function getInstalaciones(proyectoId?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("instalaciones")
    .select("*, proyectos(nombre, fecha_instalacion_programada, clientes(leads(nombre, empresa)))")
    .order("fecha_inicio", { ascending: false, nullsFirst: true });
  if (proyectoId) q = q.eq("proyecto_id", proyectoId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getInstalacionesPendientes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("v_instalaciones_pendientes").select("*");
  if (error) throw error;
  return data;
}

export async function getOperacionesStats() {
  const supabase = await createClient();
  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);

  const [proyectosRes, pendientesRes, equiposRes] = await Promise.all([
    supabase
      .from("proyectos")
      .select("*", { count: "exact", head: true })
      .gte("fecha_instalacion_programada", now.toISOString().slice(0, 10))
      .lte("fecha_instalacion_programada", in7Days.toISOString().slice(0, 10))
      .in("estado", ["programada", "en_proceso"]),
    supabase.from("proyectos").select("id", { count: "exact", head: true }).in("estado", ["pendiente", "programada", "atrasada", "en_proceso"]),
    supabase
      .from("activos")
      .select("*", { count: "exact", head: true })
      .eq("estado", "en_distribucion"),
  ]);

  return {
    instalacionesProximos7Dias: proyectosRes.count ?? 0,
    instalacionesPendientes: pendientesRes.count ?? 0,
    equiposEnDistribucion: equiposRes.count ?? 0,
  };
}

export async function createInstalacion(form: {
  proyecto_id: string;
  tecnico_asignado?: string;
  notas?: string;
}) {
  const check = await requireCanEdit();
  if (check.error) throw new Error(check.error);
  const supabase = await createClient();
  const { error } = await supabase.from("instalaciones").insert({
    proyecto_id: form.proyecto_id,
    tecnico_asignado: form.tecnico_asignado || null,
    notas: form.notas || null,
  });
  if (error) throw error;
  paths.forEach((p) => revalidatePath(p));
}
