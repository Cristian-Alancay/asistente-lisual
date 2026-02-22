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
          codigo: string
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
          link_reunion: string | null
          presupuesto_estimado_moneda: string | null
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
          cantidad_camaras: number | null
          tipo_licencia: string | null
          plan: string | null
          duracion_meses: number | null
          fecha_vencimiento: string | null
          notas_conversion: string | null
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
      chat_mensajes: {
        Row: {
          id: string
          usuario_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["chat_mensajes"]["Row"], "id" | "created_at"> & Partial<Pick<Database["public"]["Tables"]["chat_mensajes"]["Row"], "id" | "created_at">>
        Update: Partial<Database["public"]["Tables"]["chat_mensajes"]["Row"]>
      }
      tareas: {
        Row: {
          id: string
          usuario_id: string
          titulo: string
          completada: boolean
          prioridad: string | null
          fecha: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["tareas"]["Row"], "id" | "completada" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["tareas"]["Row"], "id" | "completada" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["tareas"]["Row"]>
      }
      user_manager: {
        Row: {
          id: string
          slug: string
          nombre: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["user_manager"]["Row"], "id" | "created_at"> & Partial<Pick<Database["public"]["Tables"]["user_manager"]["Row"], "id" | "created_at">>
        Update: Partial<Database["public"]["Tables"]["user_manager"]["Row"]>
      }
      personal_tareas: {
        Row: {
          id: string
          user_manager_id: string
          titulo: string
          completada: boolean
          prioridad: string | null
          fecha: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["personal_tareas"]["Row"], "id" | "completada" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["personal_tareas"]["Row"], "id" | "completada" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["personal_tareas"]["Row"]>
      }
      personal_eventos: {
        Row: {
          id: string
          user_manager_id: string
          titulo: string
          fecha_inicio: string
          fecha_fin: string
          descripcion: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["personal_eventos"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["personal_eventos"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["personal_eventos"]["Row"]>
      }
      personal_notas: {
        Row: {
          id: string
          user_manager_id: string
          titulo: string
          contenido: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["personal_notas"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["personal_notas"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["personal_notas"]["Row"]>
      }
      solicitudes_video: {
        Row: {
          id: string
          cliente_id: string
          fecha_solicitud: string
          fecha_hora_video: string
          camara_id: string | null
          motivo: string | null
          duracion_min: number | null
          estado: string
          link_descarga: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["solicitudes_video"]["Row"], "id" | "fecha_solicitud" | "estado" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["solicitudes_video"]["Row"], "id" | "fecha_solicitud" | "estado" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["solicitudes_video"]["Row"]>
      }
      revisiones: {
        Row: {
          id: string
          cliente_id: string
          tipo: string
          programada_para: string
          realizada_at: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["revisiones"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["revisiones"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["revisiones"]["Row"]>
      }
      referencias: {
        Row: {
          id: string
          cliente_referidor_id: string
          lead_referido_id: string
          incentivo_ofrecido: string | null
          incentivo_activado_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["referencias"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["referencias"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["referencias"]["Row"]>
      }
      user_manager_members: {
        Row: {
          user_manager_id: string
          user_id: string
          rol: string
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["user_manager_members"]["Row"], "created_at"> & Partial<Pick<Database["public"]["Tables"]["user_manager_members"]["Row"], "created_at">>
        Update: Partial<Database["public"]["Tables"]["user_manager_members"]["Row"]>
      }
      app_config: {
        Row: {
          id: string
          contexto: string
          key: string
          value: string | null
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["app_config"]["Row"], "id" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["app_config"]["Row"], "id" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["app_config"]["Row"]>
      }
      contactos_cliente: {
        Row: {
          id: string
          cliente_id: string
          nombre: string
          cargo: string | null
          area: string | null
          email: string | null
          telefono: string | null
          es_principal: boolean
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["contactos_cliente"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["contactos_cliente"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["contactos_cliente"]["Row"]>
      }
      reuniones: {
        Row: {
          id: string
          fathom_recording_id: number | null
          lead_id: string | null
          titulo: string | null
          titulo_calendario: string | null
          resumen_md: string | null
          transcripcion: Json | null
          action_items: Json | null
          fathom_url: string | null
          share_url: string | null
          fecha_reunion: string | null
          fecha_fin: string | null
          fecha_hora: string
          duracion_min: number
          notas: string | null
          google_event_id: string | null
          idioma: string
          raw: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["reuniones"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["reuniones"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["reuniones"]["Row"]>
      }
      reunion_participantes: {
        Row: {
          id: string
          reunion_id: string
          lead_id: string | null
          nombre: string | null
          email: string | null
          es_externo: boolean
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["reunion_participantes"]["Row"], "id" | "created_at"> & Partial<Pick<Database["public"]["Tables"]["reunion_participantes"]["Row"], "id" | "created_at">>
        Update: Partial<Database["public"]["Tables"]["reunion_participantes"]["Row"]>
      }
      casos_exito: {
        Row: {
          id: string
          nombre_proyecto: string
          empresa: string
          pais: string
          ciudad: string | null
          tipo_proyecto: string
          tamano_obra: string | null
          duracion_estimada: string | null
          perfil_cliente: string
          etapa_cliente: string | null
          nivel_presupuesto: string | null
          problemas: Json
          soluciones: Json
          resultados: Json
          metricas: Json | null
          link_instagram: string | null
          link_reel: string | null
          link_post: string | null
          link_drive: string | null
          link_timelapse: string | null
          imagen_url: string | null
          objecion_responde: string | null
          frase_gancho: string | null
          mensaje_whatsapp: string | null
          script_reunion: string | null
          momento_ideal: string | null
          destacado: boolean
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["casos_exito"]["Row"], "id" | "created_at" | "updated_at"> & Partial<Pick<Database["public"]["Tables"]["casos_exito"]["Row"], "id" | "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["casos_exito"]["Row"]>
      }
      email_log: {
        Row: {
          id: string
          tipo: EmailLogTipo
          destinatario: string
          asunto: string
          presupuesto_id: string | null
          seguimiento_id: string | null
          estado: EmailLogEstado
          resend_id: string | null
          error_detail: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["email_log"]["Row"], "id" | "estado" | "created_at"> & Partial<Pick<Database["public"]["Tables"]["email_log"]["Row"], "id" | "estado" | "created_at">>
        Update: Partial<Database["public"]["Tables"]["email_log"]["Row"]>
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
export type LeadCanalOrigen = "reunion" | "manual" | "web" | "referencia" | "whatsapp"
export type PresupuestoEstado = "borrador" | "enviado" | "aceptado" | "rechazado" | "vencido"
export type ActivoTipo = "camara" | "chip" | "teleport"
export type ActivoEstado = "en_stock" | "asignado" | "instalado" | "en_distribucion"
export type SolicitudVideoEstado = "pendiente" | "en_proceso" | "entregado"
export type RevisionTipo = "semana1" | "mes1" | "trimestral" | "semestral"
export type ChatRole = "user" | "assistant" | "system"
export type AppConfigContexto = "lisual" | "personal"
export type EmailLogTipo = "presupuesto" | "seguimiento" | "notificacion" | "general"
export type EmailLogEstado = "enviado" | "error" | "rebotado"
