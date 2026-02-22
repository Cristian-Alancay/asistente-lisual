import { supabase } from "@/lib/supabase";

export interface Reunion {
  id: string;
  fathom_recording_id: number | null;
  lead_id: string | null;
  titulo: string | null;
  titulo_calendario: string | null;
  resumen_md: string | null;
  transcripcion: TranscriptItem[] | null;
  action_items: ActionItem[] | null;
  fathom_url: string | null;
  share_url: string | null;
  fecha_reunion: string | null;
  fecha_fin: string | null;
  fecha_hora: string;
  duracion_min: number;
  notas: string | null;
  google_event_id: string | null;
  idioma: string;
  created_at: string;
  leads?: {
    id: string;
    codigo: string;
    nombre: string;
    empresa: string | null;
    email: string;
  } | null;
}

export interface TranscriptItem {
  speaker: { display_name: string; matched_calendar_invitee_email?: string | null };
  text: string;
  timestamp: string;
}

export interface ActionItem {
  description: string;
  completed: boolean;
  recording_timestamp: string;
  recording_playback_url?: string;
  assignee?: { name: string | null; email: string | null };
}

export interface ReunionParticipante {
  id: string;
  reunion_id: string;
  lead_id: string | null;
  nombre: string | null;
  email: string | null;
  es_externo: boolean;
  leads?: { id: string; codigo: string; nombre: string } | null;
}

export async function getReuniones(): Promise<Reunion[]> {
  const { data, error } = await supabase
    .from("reuniones")
    .select("*, leads(id, codigo, nombre, empresa, email)")
    .not("fathom_recording_id", "is", null)
    .order("fecha_reunion", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as unknown as Reunion[];
}

export async function getReunionesByLead(leadId: string): Promise<Reunion[]> {
  const { data, error } = await supabase
    .from("reuniones")
    .select("*, leads(id, codigo, nombre, empresa, email)")
    .eq("lead_id", leadId)
    .order("fecha_reunion", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as unknown as Reunion[];
}

export async function getReunion(id: string): Promise<Reunion | null> {
  const { data, error } = await supabase
    .from("reuniones")
    .select("*, leads(id, codigo, nombre, empresa, email)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as Reunion;
}

export async function getParticipantes(reunionId: string): Promise<ReunionParticipante[]> {
  const { data, error } = await supabase
    .from("reunion_participantes")
    .select("*, leads(id, codigo, nombre)")
    .eq("reunion_id", reunionId)
    .order("es_externo", { ascending: false })
    .order("nombre", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ReunionParticipante[];
}
