// --- Notificaciones ---

export type Notificacion = {
  id: string;
  tipo: "seguimiento" | "presupuesto_vencimiento" | "instalacion" | "revision";
  titulo: string;
  descripcion?: string;
  href: string;
  fecha?: string;
};

export type ResumenAlertasProactivas = {
  total: number;
  seguimientos: number;
  seguimientosHoy: number;
  presupuestosVencen: number;
  presupuestosVencenHoy: number;
  instalaciones: number;
  revisiones: number;
};

// --- Search ---

export type SearchResult = {
  id: string;
  type: "lead" | "cliente" | "presupuesto" | "proyecto" | "tarea" | "evento" | "nota";
  nombre: string;
  empresa?: string | null;
  email?: string | null;
  href: string;
};

// --- Seguimientos ---

export type SeguimientoPendiente = {
  id: string;
  presupuesto_id: string;
  tipo: string;
  programado_para: string;
  canal: string | null;
  lead_telefono: string | null;
  lead_email: string | null;
};

// --- Planificacion ---

export type ReunionHoy = {
  id: string;
  lead_id: string;
  fecha_hora: string;
  duracion_min: number | null;
  notas: string | null;
  leads?: { nombre: string; empresa: string | null } | null;
};

// --- Calendario ---

export type EventoCalendario = {
  id: string;
  tipo: "reunion" | "instalacion" | "seguimiento" | "revision" | "solicitud_video";
  titulo: string;
  fecha: string;
  fechaHora?: string;
  detalle?: string;
};

// --- Personal ---

export type PersonalTarea = {
  id: string;
  user_manager_id: string;
  titulo: string;
  completada: boolean;
  prioridad: string | null;
  fecha: string | null;
  created_at: string;
  updated_at: string;
};

export type PersonalEvento = {
  id: string;
  user_manager_id: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
};

export type PersonalNota = {
  id: string;
  user_manager_id: string;
  titulo: string;
  contenido: string | null;
  created_at: string;
  updated_at: string;
};

export type ProximosPersonales = {
  tareasPendientes: PersonalTarea[];
  eventosProximos: PersonalEvento[];
};

// --- Reportes ---

export type ReporteVentas = {
  leadsPorEstado: { estado: string; count: number }[];
  leadsPorCanal: { canal: string; count: number }[];
  presupuestosPorEstado: { estado: string; count: number }[];
  totalPresupuestosAceptados: number;
  montoTotalAceptado: number;
};

export type ReporteOperaciones = {
  proyectosPorEstado: { estado: string; count: number }[];
  instalacionesProximas7Dias: number;
  equiposEnStock: number;
};

export type ReporteExperiencia = {
  solicitudesVideoPendientes: number;
  revisionesPendientes: number;
  referenciasTotal: number;
};
