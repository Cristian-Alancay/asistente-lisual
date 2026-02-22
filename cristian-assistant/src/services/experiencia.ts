import { supabase } from "@/lib/supabase";

export async function getSolicitudesVideo(clienteId?: string) {
  let q = supabase
    .from("solicitudes_video")
    .select("*, clientes(leads(nombre, empresa)), activos(codigo, tipo)")
    .order("fecha_solicitud", { ascending: false });
  if (clienteId) q = q.eq("cliente_id", clienteId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createSolicitudVideo(form: {
  cliente_id: string;
  fecha_hora_video: string;
  camara_id?: string;
  motivo?: string;
  duracion_min?: number;
}) {
  const { error } = await supabase.from("solicitudes_video").insert({
    cliente_id: form.cliente_id,
    fecha_hora_video: form.fecha_hora_video,
    camara_id: form.camara_id || null,
    motivo: form.motivo || null,
    duracion_min: form.duracion_min ?? null,
  });
  if (error) throw error;
}

export async function updateSolicitudVideo(
  id: string,
  updates: { estado?: string; link_descarga?: string }
) {
  const { error } = await supabase
    .from("solicitudes_video")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function getRevisiones(clienteId?: string) {
  let q = supabase
    .from("revisiones")
    .select("*, clientes(leads(nombre, empresa))")
    .order("programada_para", { ascending: true });
  if (clienteId) q = q.eq("cliente_id", clienteId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createRevision(form: {
  cliente_id: string;
  tipo: string;
  programada_para: string;
  notas?: string;
}) {
  const { error } = await supabase.from("revisiones").insert({
    cliente_id: form.cliente_id,
    tipo: form.tipo,
    programada_para: form.programada_para,
    notas: form.notas || null,
  });
  if (error) throw error;
}

export async function marcarRevisionRealizada(id: string) {
  const { error } = await supabase
    .from("revisiones")
    .update({ realizada_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getReferencias() {
  const { data, error } = await supabase
    .from("referencias")
    .select("*, clientes(leads(nombre, empresa)), leads(nombre, email, empresa)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createReferencia(form: {
  cliente_referidor_id: string;
  lead_referido_id: string;
  incentivo_ofrecido?: string;
}) {
  const { error } = await supabase.from("referencias").insert({
    cliente_referidor_id: form.cliente_referidor_id,
    lead_referido_id: form.lead_referido_id,
    incentivo_ofrecido: form.incentivo_ofrecido || null,
  });
  if (error) throw error;
}

export async function activarIncentivoReferencia(id: string) {
  const { error } = await supabase
    .from("referencias")
    .update({ incentivo_activado_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
