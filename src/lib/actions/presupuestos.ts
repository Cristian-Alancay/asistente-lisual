"use server";

import { createClient } from "@/lib/supabase/server";
import { withEditAuth } from "./with-edit-auth";
import type { PresupuestoFormData, PresupuestoItem } from "@/lib/validations/presupuesto";
import { crearSeguimientosParaPresupuesto } from "./seguimientos";

const PATHS = ["/dashboard", "/dashboard/presupuestos", "/dashboard/leads"];

function calcTotals(items: PresupuestoItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0);
  const impuestos = Math.round(subtotal * 0.21 * 100) / 100; // 21% IVA
  const total = subtotal + impuestos;
  return { subtotal, impuestos, total };
}

export async function getPresupuestos(leadId?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("presupuestos")
    .select(`
      *,
      leads (id, nombre, empresa, email)
    `)
    .order("created_at", { ascending: false });
  if (leadId) q = q.eq("lead_id", leadId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getPresupuesto(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presupuestos")
    .select("*, leads(id, nombre, empresa, email, telefono)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPresupuesto(form: PresupuestoFormData) {
  return withEditAuth(PATHS, async ({ supabase }) => {
    const { subtotal, impuestos, total } = calcTotals(form.items);
    const itemsDb = form.items.map((i) => ({
      descripcion: i.descripcion,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
    }));

    const { data, error } = await supabase
      .from("presupuestos")
      .insert({
        lead_id: form.lead_id,
        numero: form.numero,
        fecha_emision: form.fecha_emision,
        vigencia_hasta: form.vigencia_hasta,
        items: itemsDb,
        subtotal,
        impuestos,
        total,
        moneda: form.moneda,
        estado: form.estado,
      })
      .select("id")
      .single();
    if (error) throw error;

    if (form.estado === "enviado" && data) {
      const { data: lead } = await supabase
        .from("leads")
        .select("telefono")
        .eq("id", form.lead_id)
        .single();
      const tieneTelefono = !!lead?.telefono;
      await crearSeguimientosParaPresupuesto(
        data.id,
        form.fecha_emision,
        form.vigencia_hasta,
        tieneTelefono
      );
    }
  });
}

export async function updatePresupuesto(id: string, form: PresupuestoFormData) {
  return withEditAuth(PATHS, async ({ supabase }) => {
    const { subtotal, impuestos, total } = calcTotals(form.items);
    const itemsDb = form.items.map((i) => ({
      descripcion: i.descripcion,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
    }));

    const { error } = await supabase
      .from("presupuestos")
      .update({
        lead_id: form.lead_id,
        numero: form.numero,
        fecha_emision: form.fecha_emision,
        vigencia_hasta: form.vigencia_hasta,
        items: itemsDb,
        subtotal,
        impuestos,
        total,
        moneda: form.moneda,
        estado: form.estado,
      })
      .eq("id", id);
    if (error) throw error;
  });
}

export async function updatePresupuestoEstado(id: string, estado: PresupuestoFormData["estado"]) {
  return withEditAuth(PATHS, async ({ supabase }) => {
    const pres = await getPresupuesto(id);
    const { error } = await supabase
      .from("presupuestos")
      .update({ estado })
      .eq("id", id);
    if (error) throw error;

    if (estado === "enviado") {
      const { data: segs } = await supabase
        .from("seguimientos")
        .select("id")
        .eq("presupuesto_id", id)
        .limit(1);
      if (!segs?.length) {
        const lead = Array.isArray(pres.leads) ? pres.leads[0] : pres.leads;
        const tieneTelefono = !!lead?.telefono;
        await crearSeguimientosParaPresupuesto(
          id,
          pres.fecha_emision,
          pres.vigencia_hasta,
          tieneTelefono
        );
      }
    }
  });
}

export async function deletePresupuesto(id: string) {
  return withEditAuth(PATHS, async ({ supabase }) => {
    const { error } = await supabase.from("presupuestos").delete().eq("id", id);
    if (error) throw error;
  });
}

export async function getProximoNumero() {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const { data } = await supabase
    .from("presupuestos")
    .select("numero")
    .like("numero", `PRE-${year}-%`)
    .order("numero", { ascending: false })
    .limit(1);
  const last = data?.[0]?.numero;
  if (!last) return `PRE-${year}-001`;
  const match = last.match(/PRE-\d{4}-(\d+)/);
  const n = match ? parseInt(match[1], 10) + 1 : 1;
  return `PRE-${year}-${String(n).padStart(3, "0")}`;
}
