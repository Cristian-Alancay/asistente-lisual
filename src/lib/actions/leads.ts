"use server";

import { createClient } from "@/lib/supabase/server";
import { requireCanEdit } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { LeadFormData } from "@/lib/validations/lead";

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
  const check = await requireCanEdit();
  if (check.error) throw new Error(check.error);
  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    nombre: form.nombre,
    empresa: form.empresa || null,
    email: form.email,
    telefono: form.telefono || null,
    canal_origen: form.canal_origen,
    estado: form.estado,
    presupuesto_estimado: form.presupuesto_estimado ?? null,
    necesidad: form.necesidad || null,
    fecha_decision_estimada: form.fecha_decision_estimada || null,
    notas: form.notas || null,
  });
  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
}

export async function updateLead(id: string, form: LeadFormData) {
  const check = await requireCanEdit();
  if (check.error) throw new Error(check.error);
  const supabase = await createClient();
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
      necesidad: form.necesidad || null,
      fecha_decision_estimada: form.fecha_decision_estimada || null,
      notas: form.notas || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
}

export async function deleteLead(id: string) {
  const check = await requireCanEdit();
  if (check.error) throw new Error(check.error);
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
}
