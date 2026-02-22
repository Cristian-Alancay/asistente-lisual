import { supabase } from "@/lib/supabase";
import type { PresupuestoFormData, PresupuestoItem } from "@/lib/validations/presupuesto";
import { crearSeguimientosParaPresupuesto } from "./seguimientos";

function calcTotals(items: PresupuestoItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0);
  const impuestos = Math.round(subtotal * 0.21 * 100) / 100;
  const total = subtotal + impuestos;
  return { subtotal, impuestos, total };
}

export async function getPresupuestos(leadId?: string) {
  let q = supabase
    .from("presupuestos")
    .select("*, leads(id, codigo, nombre, empresa, email)")
    .order("created_at", { ascending: false });
  if (leadId) q = q.eq("lead_id", leadId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getPresupuesto(id: string) {
  const { data, error } = await supabase
    .from("presupuestos")
    .select("*, leads(id, codigo, nombre, empresa, email, telefono)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPresupuesto(form: PresupuestoFormData) {
  const calculated = calcTotals(form.items);
  const subtotal = form.subtotal_override ?? calculated.subtotal;
  const impuestos = form.impuestos_override ?? calculated.impuestos;
  const total = form.total_override ?? calculated.total;
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
}

export async function updatePresupuesto(id: string, form: PresupuestoFormData) {
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
}

export async function updatePresupuestoEstado(
  id: string,
  estado: PresupuestoFormData["estado"]
) {
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
      const tieneTelefono = !!(lead as { telefono?: string } | null)?.telefono;
      await crearSeguimientosParaPresupuesto(
        id,
        pres.fecha_emision,
        pres.vigencia_hasta,
        tieneTelefono
      );
    }
  }
}

export async function deletePresupuesto(id: string) {
  const { error } = await supabase.from("presupuestos").delete().eq("id", id);
  if (error) throw error;
}

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function buildClientTag(empresaNombre?: string, clienteNombre?: string): string {
  const raw = (empresaNombre?.trim() || clienteNombre?.trim() || "").toUpperCase();
  if (!raw) return "CLI";
  return raw
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.slice(0, 4))
    .join("")
    .slice(0, 8) || "CLI";
}

export async function getProximoNumero(clienteNombre?: string, empresaNombre?: string) {
  const now = new Date();
  const dateStr = toDateStr(now);

  const pattern = `%-LIS-${dateStr}-%`;
  const { data } = await supabase
    .from("presupuestos")
    .select("numero")
    .like("numero", pattern)
    .order("numero", { ascending: false })
    .limit(1);

  let seq = 1;
  if (data?.[0]?.numero) {
    const match = data[0].numero.match(/-(\d+)$/);
    if (match) seq = parseInt(match[1], 10) + 1;
  }

  const tag = buildClientTag(empresaNombre, clienteNombre);
  return `${tag} PN_ LIS-${dateStr}-${String(seq).padStart(4, "0")}`;
}
