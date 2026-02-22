import { supabase } from "@/lib/supabase";

export type EmailType = "presupuesto" | "seguimiento" | "notificacion" | "general";

export interface SendEmailPayload {
  type: EmailType;
  to: string;
  data: Record<string, unknown>;
  attachments?: { filename: string; content: string }[];
  presupuesto_id?: string;
  seguimiento_id?: string;
}

export interface SendEmailResult {
  ok: boolean;
  resend_id: string;
  subject: string;
}

export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const { data, error } = await supabase.functions.invoke<SendEmailResult>("send-email", {
    body: payload,
  });
  if (error) throw new Error(error.message ?? "Error al enviar email");
  if (!data) throw new Error("Respuesta vacía del servidor");
  return data;
}

export interface EmailLogEntry {
  id: string;
  tipo: EmailType;
  destinatario: string;
  asunto: string;
  presupuesto_id: string | null;
  seguimiento_id: string | null;
  estado: "enviado" | "error" | "rebotado";
  resend_id: string | null;
  error_detail: string | null;
  created_at: string;
}

export async function getEmailLog(presupuestoId?: string): Promise<EmailLogEntry[]> {
  let q = supabase
    .from("email_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (presupuestoId) {
    q = q.eq("presupuesto_id", presupuestoId);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as EmailLogEntry[];
}

export async function getLastEmailForPresupuesto(presupuestoId: string): Promise<EmailLogEntry | null> {
  const { data, error } = await supabase
    .from("email_log")
    .select("*")
    .eq("presupuesto_id", presupuestoId)
    .eq("estado", "enviado")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as EmailLogEntry | null;
}
