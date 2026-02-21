"use server";

import { createClient } from "@/lib/supabase/server";
import { withEditAuth } from "./with-edit-auth";
import type { LeadFormData } from "@/lib/validations/lead";

const PATHS = ["/dashboard", "/dashboard/leads"];

export async function getLeads() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLead(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createLead(form: LeadFormData) {
  return withEditAuth(PATHS, async ({ supabase }) => {
    const { error } = await supabase.from("leads").insert({
      nombre: form.nombre,
      empresa: form.empresa || null,
      email: form.email,
      telefono: form.telefono || null,
      canal_origen: form.canal_origen,
      estado: form.estado,
      presupuesto_estimado: form.presupuesto_estimado ?? null,
      presupuesto_estimado_moneda: form.presupuesto_estimado_moneda ?? "ARS",
      link_reunion: form.link_reunion?.trim() || null,
      necesidad: form.necesidad || null,
      fecha_decision_estimada: form.fecha_decision_estimada || null,
      notas: form.notas || null,
    });
    if (error) throw error;
  });
}

export async function updateLead(id: string, form: LeadFormData) {
  return withEditAuth(PATHS, async ({ supabase }) => {
    const { error } = await supabase
      .from("leads")
      .update({
        nombre: form.nombre,
        empresa: form.empresa || null,
        email: form.email,
        telefono: form.telefono || null,
        canal_origen: form.canal_origen,
        estado: form.estado,
        presupuesto_estimado: form.presupuesto_estimado ?? null,
        presupuesto_estimado_moneda: form.presupuesto_estimado_moneda ?? "ARS",
        link_reunion: form.link_reunion?.trim() || null,
        necesidad: form.necesidad || null,
        fecha_decision_estimada: form.fecha_decision_estimada || null,
        notas: form.notas || null,
      })
      .eq("id", id);
    if (error) throw error;
  });
}

export async function deleteLead(id: string) {
  return withEditAuth(PATHS, async ({ supabase }) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
  });
}
