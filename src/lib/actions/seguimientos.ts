"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const paths = ["/dashboard", "/dashboard/presupuestos"];

export type SeguimientoPendiente = {
  id: string;
  presupuesto_id: string;
  tipo: string;
  programado_para: string;
  canal: string | null;
  lead_telefono: string | null;
  lead_email: string | null;
};

/**
 * Obtiene seguimientos pendientes (programado_para <= now, ejecutado_at IS NULL).
 * Usa service client para cron (sin sesión de usuario).
 */
export async function getSeguimientosPendientes(
  useServiceClient = false
): Promise<SeguimientoPendiente[]> {
  const supabase = useServiceClient ? createServiceClient() : await createClient();

  const { data: seguimientos, error } = await supabase
    .from("seguimientos")
    .select(`
      id,
      presupuesto_id,
      tipo,
      programado_para,
      canal
    `)
    .is("ejecutado_at", null)
    .lte("programado_para", new Date().toISOString());

  if (error) throw error;
  if (!seguimientos?.length) return [];

  const ids = seguimientos.map((s) => s.presupuesto_id);
  const { data: presupuestos } = await supabase
    .from("presupuestos")
    .select("id, lead_id")
    .in("id", ids);

  const leadIds = [...new Set((presupuestos ?? []).map((p) => p.lead_id))];
  const { data: leads } = await supabase
    .from("leads")
    .select("id, telefono, email")
    .in("id", leadIds);

  const leadMap = new Map((leads ?? []).map((l) => [l.id, l]));
  const presupuestoMap = new Map((presupuestos ?? []).map((p) => [p.id, p]));

  return seguimientos.map((s) => {
    const pres = presupuestoMap.get(s.presupuesto_id);
    const lead = pres ? leadMap.get(pres.lead_id) : null;
    return {
      ...s,
      lead_telefono: lead?.telefono ?? null,
      lead_email: lead?.email ?? null,
    };
  });
}

export async function marcarSeguimientoEjecutado(
  id: string,
  contenidoUsado: "cont1" | "cont2" | "cont3" = "cont1",
  useServiceClient = false
) {
  const supabase = useServiceClient ? createServiceClient() : await createClient();
  const { error } = await supabase
    .from("seguimientos")
    .update({
      ejecutado_at: new Date().toISOString(),
      contenido_usado: contenidoUsado,
    })
    .eq("id", id);
  if (error) throw error;
  paths.forEach((p) => revalidatePath(p));
}

/**
 * Crea los 3 seguimientos para un presupuesto enviado:
 * - d3: fecha_emision + 3 días, canal whatsapp si hay teléfono
 * - d7: fecha_emision + 7 días
 * - pre_vencimiento: vigencia_hasta - 1 día
 */
export async function crearSeguimientosParaPresupuesto(
  presupuestoId: string,
  fechaEmision: string,
  vigenciaHasta: string,
  leadTieneTelefono: boolean
) {
  const supabase = await createClient();

  const fe = new Date(fechaEmision);
  const vh = new Date(vigenciaHasta);

  const d3 = new Date(fe);
  d3.setDate(d3.getDate() + 3);
  const d7 = new Date(fe);
  d7.setDate(d7.getDate() + 7);
  const preVen = new Date(vh);
  preVen.setDate(preVen.getDate() - 1);

  const canal = leadTieneTelefono ? "whatsapp" : "email";

  const rows = [
    { presupuesto_id: presupuestoId, tipo: "d3", programado_para: d3.toISOString(), canal },
    { presupuesto_id: presupuestoId, tipo: "d7", programado_para: d7.toISOString(), canal },
    {
      presupuesto_id: presupuestoId,
      tipo: "pre_vencimiento",
      programado_para: preVen.toISOString(),
      canal,
    },
  ];

  const { error } = await supabase.from("seguimientos").insert(rows);
  if (error) throw error;
  paths.forEach((p) => revalidatePath(p));
}
