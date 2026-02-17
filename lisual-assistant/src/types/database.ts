export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          nombre: string
          empresa: string | null
          email: string
          telefono: string | null
          canal_origen: string
          estado: string
          presupuesto_estimado: number | null
          necesidad: string | null
          fecha_decision_estimada: string | null
          notas: string | null
          referred_by_lead_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["leads"]["Row"]>
      }
      presupuestos: {
        Row: {
          id: string
          lead_id: string
          numero: string
          fecha_emision: string
          vigencia_hasta: string
          items: Json
          subtotal: number
          impuestos: number
          total: number
          moneda: string
          estado: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["presupuestos"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["presupuestos"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["presupuestos"]["Row"]>
      }
      clientes: {
        Row: {
          id: string
          lead_id: string
          id_lisual_pro: string | null
          id_empresa: string | null
          fecha_pago: string
          monto_pagado: number
          metodo_pago: string | null
          referencia_pago: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["clientes"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["clientes"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["clientes"]["Row"]>
      }
      proyectos: {
        Row: {
          id: string
          cliente_id: string
          nombre: string
          direccion: string | null
          contacto_sitio: string | null
          telefono_sitio: string | null
          fecha_instalacion_programada: string | null
          estado: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["proyectos"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["proyectos"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["proyectos"]["Row"]>
      }
      activos: {
        Row: {
          id: string
          proyecto_id: string | null
          tipo: string
          codigo: string
          numero_serie: string | null
          iccid: string | null
          numero_telefono: string | null
          estado: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["activos"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["activos"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["activos"]["Row"]>
      }
      instalaciones: {
        Row: {
          id: string
          proyecto_id: string
          tecnico_asignado: string | null
          fecha_inicio: string | null
          fecha_fin: string | null
          checklist_completado: boolean | null
          fotos_urls: Json | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["instalaciones"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["instalaciones"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["instalaciones"]["Row"]>
      }
      seguimientos: {
        Row: {
          id: string
          presupuesto_id: string
          tipo: string
          programado_para: string
          ejecutado_at: string | null
          contenido_usado: string | null
          canal: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["seguimientos"]["Row"], "id" | "created_at"> & Partial<Pick<Database["public"]["Tables"]["seguimientos"]["Row"], "id" | "created_at">>
        Update: Partial<Database["public"]["Tables"]["seguimientos"]["Row"]>
      }
      reuniones: {
        Row: {
          id: string
          lead_id: string
          fecha_hora: string
          duracion_min: number | null
          notas: string | null
          google_event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["reuniones"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["reuniones"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["reuniones"]["Row"]>
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: string
          additional_emails: string[]
          phone_1: string | null
          phone_2: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>
      }
    }
    Views: {
      v_instalaciones_pendientes: {
        Row: {
          proyecto_id: string | null
          proyecto_nombre: string | null
          fecha_instalacion_programada: string | null
          proyecto_estado: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          cliente_empresa: string | null
          equipos_en_distribucion: number | null
        }
      }
    }
  }
}

export type LeadEstado = "prospecto" | "negociacion" | "convertido" | "perdido"
export type PresupuestoEstado = "borrador" | "enviado" | "aceptado" | "rechazado" | "vencido"
export type ActivoTipo = "camara" | "chip" | "teleport"
export type ActivoEstado = "en_stock" | "asignado" | "instalado" | "en_distribucion"
