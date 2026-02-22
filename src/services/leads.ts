import { supabase } from "@/lib/supabase";
import type { LeadFormData } from "@/lib/validations/lead";

export async function getLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*, codigo, presupuestos(id, numero)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLead(id: string) {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

function buildPayload(form: LeadFormData) {
  return {
    nombre: form.nombre,
    empresa: form.empresa || null,
    email: form.email,
    telefono: form.telefono || null,
    canal_origen: form.canal_origen,
    estado: form.estado,
    presupuesto_estimado: form.presupuesto_estimado ?? null,
    presupuesto_estimado_moneda: form.presupuesto_estimado_moneda ?? "USD",
    cotizacion_dolar_valor: form.cotizacion_dolar_valor ?? null,
    cotizacion_dolar_fecha: form.cotizacion_dolar_fecha || null,
    link_reunion: form.link_reunion?.trim() || null,
    necesidad: form.necesidad || null,
    fecha_decision_estimada: form.fecha_decision_estimada || null,
    notas: form.notas || null,
  };
}

export async function createLead(form: LeadFormData) {
  const { error } = await supabase.from("leads").insert(buildPayload(form));
  if (error) throw error;
}

export async function updateLead(id: string, form: LeadFormData) {
  const { error } = await supabase
    .from("leads")
    .update(buildPayload(form))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

export interface ConvertLeadPayload {
  lead_id: string;
  fecha_pago: string;
  monto_pagado: number;
  metodo_pago?: string;
  referencia_pago?: string;
  id_lisual_pro?: string;
  id_empresa?: string;
  cantidad_camaras?: number;
  tipo_licencia?: string;
  plan?: string;
  duracion_meses?: number;
  fecha_vencimiento?: string;
  notas_conversion?: string;
}

export async function convertLeadToCliente(payload: ConvertLeadPayload) {
  const { error: updateErr } = await supabase
    .from("leads")
    .update({ estado: "convertido" })
    .eq("id", payload.lead_id);
  if (updateErr) throw updateErr;

  const { data, error: insertErr } = await supabase
    .from("clientes")
    .insert({
      lead_id: payload.lead_id,
      fecha_pago: payload.fecha_pago,
      monto_pagado: payload.monto_pagado,
      metodo_pago: payload.metodo_pago || null,
      referencia_pago: payload.referencia_pago || null,
      id_lisual_pro: payload.id_lisual_pro || null,
      id_empresa: payload.id_empresa || null,
      cantidad_camaras: payload.cantidad_camaras ?? null,
      tipo_licencia: payload.tipo_licencia || null,
      plan: payload.plan || null,
      duracion_meses: payload.duracion_meses ?? 12,
      fecha_vencimiento: payload.fecha_vencimiento || null,
      notas_conversion: payload.notas_conversion || null,
    })
    .select()
    .single();

  if (insertErr) {
    await supabase.from("leads").update({ estado: "negociacion" }).eq("id", payload.lead_id);
    throw insertErr;
  }

  // Auto-create primary contact from lead data
  if (data?.id) {
    const { data: lead } = await supabase
      .from("leads")
      .select("nombre, email, telefono")
      .eq("id", payload.lead_id)
      .single();

    if (lead) {
      await supabase.from("contactos_cliente").insert({
        cliente_id: data.id,
        nombre: lead.nombre,
        cargo: "Contacto principal",
        area: "direccion",
        email: lead.email || null,
        telefono: lead.telefono || null,
        es_principal: true,
        notas: null,
      });
    }
  }

  return data;
}
