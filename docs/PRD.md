# PRD — Assistant Cristian Alancay

> Product Requirements Document  
> Última actualización: 2026-02-21  
> Versión: 1.0

---

## 1. Resumen Ejecutivo

**Assistant Cristian Alancay** es un CRM + asistente inteligente full-stack para **Lisual** (empresa de video-seguridad), diseñado para gestionar todo el ciclo de vida comercial: desde la captación de leads hasta la post-venta, incluyendo un agente de IA conversacional y automatizaciones via WhatsApp.

El sistema opera en dos contextos:
- **Trabajo (Lisual)**: Pipeline de ventas, operaciones, instalaciones y experiencia al cliente.
- **Personal (Cristian Alancay)**: Gestión de tareas, calendario y notas personales.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | 16.1.6 |
| **UI** | React + Radix UI + shadcn/ui + Tailwind CSS | React 19, Tailwind 4 |
| **Base de datos** | Supabase (PostgreSQL + Auth + RLS) | supabase-js 2.96 |
| **IA / Agente** | LangChain + OpenAI (GPT-4o / GPT-4o-mini) | langchain 1.2.24 |
| **WhatsApp** | Evolution API (webhook + envio) | — |
| **Formularios** | React Hook Form + Zod | RHF 7.71, Zod 4.3 |
| **Charts** | Recharts | — |
| **Deployment** | Vercel | — |
| **Testing** | Vitest + Testing Library | Vitest 4 |

---

## 3. Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js 16 (App Router)                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐ │ │
│  │  │  Pages   │  │   API    │  │    Server Actions      │ │ │
│  │  │  (SSR)   │  │  Routes  │  │  (mutations + queries) │ │ │
│  │  └──────────┘  └──────────┘  └───────────────────────┘ │ │
│  │       │              │                    │             │ │
│  │       └──────────────┼────────────────────┘             │ │
│  │                      │                                  │ │
│  │              ┌───────┴───────┐                          │ │
│  │              │   Supabase    │                          │ │
│  │              │  SSR Client   │                          │ │
│  │              └───────┬───────┘                          │ │
│  └──────────────────────┼──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────┼──────────────────────────────────┐ │
│  │            LangChain Agent (ReAct)                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │ │
│  │  │list_leads│  │create_   │  │ ocr_image│              │ │
│  │  │search_   │  │  lead    │  │ analyze_ │              │ │
│  │  │leads     │  │          │  │  image   │              │ │
│  │  └──────────┘  └──────────┘  └──────────┘              │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────┬────────────────┘
               │                              │
       ┌───────┴───────┐              ┌───────┴───────┐
       │   Supabase    │              │  Evolution    │
       │  PostgreSQL   │              │  API          │
       │  + Auth + RLS │              │  (WhatsApp)   │
       └───────────────┘              └───────────────┘
```

---

## 4. Módulos Funcionales

### 4.1 Autenticación y Autorización

**Flujo de autenticación:**
1. Login via email/password o OAuth (Google, Microsoft/Azure, Apple)
2. Callback en `/auth/callback` intercambia código por sesión
3. Middleware valida sesión en cada request

**Sistema de roles:**

| Rol | Permisos |
|---|---|
| `admin` | Acceso total, incluye `/dashboard/configuracion` |
| `usuario` | CRUD completo excepto configuración global |
| `viewer` | Solo lectura (bloqueado por `requireCanEdit()`) |

**Seguridad adicional:**
- **Email allowlist**: Variable `ALLOWED_USER_EMAILS` restringe qué cuentas pueden acceder.
- **Registro deshabilitado**: `/register` redirige a `/login` via middleware.
- **RLS en todas las tablas**: Cada tabla tiene Row Level Security habilitado.
- **Headers de seguridad**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

---

### 4.2 Pipeline de Ventas (CRM)

#### 4.2.1 Leads

**Entidad principal del CRM.** Representa un prospecto o contacto comercial.

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | text | Nombre completo (requerido) |
| `empresa` | text | Empresa u organización |
| `email` | text | Email de contacto (requerido) |
| `telefono` | text | Teléfono |
| `canal_origen` | enum | `reunion`, `manual`, `web`, `referencia` |
| `estado` | enum | `prospecto` → `negociacion` → `convertido` / `perdido` |
| `presupuesto_estimado` | numeric | Monto estimado del presupuesto |
| `presupuesto_estimado_moneda` | enum | `ARS` o `USD` |
| `link_reunion` | text | URL de reunión (Google Meet, Zoom, etc.) |
| `necesidad` | text | Descripción de la necesidad del cliente |
| `referred_by_lead_id` | uuid | Lead que refirió a este contacto |

**Estados del pipeline:**
```
prospecto → negociacion → convertido
                        → perdido
```

**Funcionalidades:**
- CRUD completo (crear, leer, actualizar, eliminar)
- Tabla con filtros y búsqueda
- Formulario con validación Zod
- Acciones rápidas: editar estado, agendar reunión

#### 4.2.2 Presupuestos

**Cotizaciones/presupuestos vinculados a leads.**

| Campo | Tipo | Descripción |
|---|---|---|
| `lead_id` | uuid | Lead asociado (requerido) |
| `numero` | text | Número único (ej: `PRE-2026-001`) |
| `fecha_emision` | date | Fecha de emisión |
| `vigencia_hasta` | date | Fecha de vencimiento |
| `items` | jsonb | Array de ítems: `{ descripcion, cantidad, precio_unitario }` |
| `subtotal` / `impuestos` / `total` | numeric | Totales calculados |
| `moneda` | enum | `ARS` o `USD` |
| `estado` | enum | `borrador` → `enviado` → `aceptado` / `rechazado` / `vencido` |

**Automatización**: Al cambiar estado a `enviado`, se crean automáticamente 3 seguimientos:
- **d3**: A los 3 días del envío
- **d7**: A los 7 días del envío
- **pre_vencimiento**: 2 días antes del vencimiento

#### 4.2.3 Seguimientos Automáticos

Sistema de follow-up automatizado que opera via Vercel Cron (diario a las 08:00 AM):

1. Consulta seguimientos pendientes (`ejecutado_at IS NULL` y `programado_para <= now`)
2. Envía mensaje via WhatsApp (Evolution API) al teléfono del lead
3. Marca como ejecutado con timestamp

#### 4.2.4 Reuniones

| Campo | Tipo | Descripción |
|---|---|---|
| `lead_id` | uuid | Lead asociado |
| `fecha_hora` | timestamptz | Fecha y hora de la reunión |
| `duracion_min` | integer | Duración en minutos (default: 60) |
| `notas` | text | Notas de la reunión |
| `google_event_id` | text | ID del evento en Google Calendar |

#### 4.2.5 Clientes (Conversión)

Cuando un lead se convierte en cliente:

| Campo | Tipo | Descripción |
|---|---|---|
| `lead_id` | uuid | Lead de origen (unique) |
| `id_lisual_pro` | text | ID en Lisual Pro |
| `id_empresa` | text | ID de empresa en sistema externo |
| `fecha_pago` | date | Fecha del primer pago |
| `monto_pagado` | numeric | Monto del pago |
| `metodo_pago` | text | Método de pago |

---

### 4.3 Operaciones

#### 4.3.1 Proyectos

Cada cliente puede tener múltiples proyectos de instalación:

| Campo | Tipo | Descripción |
|---|---|---|
| `cliente_id` | uuid | Cliente asociado |
| `nombre` | text | Nombre del proyecto |
| `direccion` | text | Dirección de la instalación |
| `contacto_sitio` | text | Contacto en el sitio |
| `fecha_instalacion_programada` | date | Fecha programada |
| `estado` | enum | `pendiente` → `programada` → `en_proceso` → `completada` / `atrasada` |

#### 4.3.2 Activos (Equipamiento)

Inventario de equipos gestionados:

| Tipo | Descripción |
|---|---|
| `camara` | Cámaras de seguridad |
| `chip` | Chips de conectividad |
| `teleport` | Equipos Teleport |

**Estados**: `en_stock` → `asignado` → `instalado` / `en_distribucion`

Cada activo tiene: código, número de serie, ICCID (para chips), número de teléfono, y puede estar asignado a un proyecto.

#### 4.3.3 Instalaciones

Registro de cada instalación física:

| Campo | Tipo | Descripción |
|---|---|---|
| `proyecto_id` | uuid | Proyecto asociado |
| `tecnico_asignado` | text | Nombre del técnico |
| `fecha_inicio` / `fecha_fin` | timestamptz | Período de instalación |
| `checklist_completado` | boolean | Si completó el checklist |
| `fotos_urls` | jsonb | URLs de fotos de la instalación |

**Vista `v_instalaciones_pendientes`**: Join de proyectos + clientes + leads que muestra instalaciones pendientes/programadas/atrasadas con conteo de equipos en distribución.

---

### 4.4 Experiencia al Cliente (Post-venta)

#### 4.4.1 Solicitudes de Video

Gestión de pedidos de recuperación de video de las cámaras:

| Campo | Tipo | Descripción |
|---|---|---|
| `cliente_id` | uuid | Cliente solicitante |
| `fecha_hora_video` | timestamptz | Fecha/hora del video solicitado |
| `camara_id` | uuid | Cámara específica |
| `motivo` | text | Motivo de la solicitud |
| `estado` | enum | `pendiente` → `en_proceso` → `entregado` |
| `link_descarga` | text | URL de descarga una vez procesado |

#### 4.4.2 Revisiones Programadas

Check-ins periódicos con clientes:

| Tipo | Momento |
|---|---|
| `semana1` | 1 semana post-instalación |
| `mes1` | 1 mes post-instalación |
| `trimestral` | Cada 3 meses |
| `semestral` | Cada 6 meses |

Cada revisión tiene fecha programada y puede marcarse como realizada.

#### 4.4.3 Programa de Referencias

| Campo | Tipo | Descripción |
|---|---|---|
| `cliente_referidor_id` | uuid | Cliente que refiere |
| `lead_referido_id` | uuid | Lead referido |
| `incentivo_ofrecido` | text | Descripción del incentivo |
| `incentivo_activado_at` | timestamptz | Cuándo se activó el incentivo |

---

### 4.5 Agente de IA (LangChain)

#### Configuración

| Parámetro | Valor |
|---|---|
| **Motor** | LangChain ReAct Agent |
| **Modelo chat** | GPT-4o (temperatura 0.3) |
| **Modelo visión** | GPT-4o (temperatura 0.2) |
| **Modelo fallback** | GPT-4o-mini |
| **Idioma** | Español (system prompt en español) |
| **Recursion limit** | 20 |
| **Streaming** | Si (token-by-token via ReadableStream) |

#### Tools del Agente

| Tool | Descripción | Acceso DB |
|---|---|---|
| `list_leads` | Lista todos los leads | Service role (bypass RLS) |
| `search_leads` | Busca leads por nombre/empresa/email | Service role |
| `create_lead` | Crea un nuevo lead | Service role |
| `get_lead` | Obtiene detalle de un lead por ID | Service role |
| `list_presupuestos` | Lista presupuestos con lead asociado | Service role |
| `ocr_image` | Extrae texto de una imagen via GPT-4o | OpenAI API |
| `analyze_image` | Analiza una imagen y responde preguntas | OpenAI API |

#### Detección de Intención

Clasificador separado que detecta la intención del usuario:

| Intención | Descripción |
|---|---|
| `crear_lead` | El usuario quiere crear un nuevo lead |
| `consultar_presupuesto` | Pregunta sobre presupuestos |
| `consultar_estado` | Consulta estado de leads o proyectos |
| `agendar_visita` | Quiere agendar una reunión/visita |
| `informacion_servicios` | Pregunta sobre servicios de Lisual |
| `otro` | Intención no clasificada |

Retorna: intención, confianza (0-1), resumen, y datos extraídos.

#### Canales de Acceso

1. **Chat web** (`/dashboard/chat`): UI con streaming, historial persistido en `chat_mensajes`.
2. **API Agent** (`/api/agent`): Endpoint JSON, soporta imágenes (base64).
3. **WhatsApp webhook** (`/api/webhook/whatsapp`): Recibe mensajes + imágenes via Evolution API, ejecuta el agente, auto-crea leads desde intención, y responde al número.

---

### 4.6 Contexto Personal

Espacio privado para Cristian Alancay, restringido por membresía en `user_manager`:

#### 4.6.1 Tareas Personales

| Campo | Tipo | Descripción |
|---|---|---|
| `titulo` | text | Título de la tarea |
| `completada` | boolean | Estado de completitud |
| `prioridad` | enum | `baja`, `normal`, `alta` |
| `fecha` | date | Fecha de la tarea |

#### 4.6.2 Eventos Personales

| Campo | Tipo | Descripción |
|---|---|---|
| `titulo` | text | Título del evento |
| `fecha_inicio` / `fecha_fin` | timestamptz | Período del evento |
| `descripcion` | text | Descripción |

#### 4.6.3 Notas Personales

| Campo | Tipo | Descripción |
|---|---|---|
| `titulo` | text | Título de la nota |
| `contenido` | text | Contenido de la nota |

#### 4.6.4 Configuración Personal

Key-value store en `app_config` (contexto `personal`):
- `timezone`: Zona horaria
- `recordatorios_activos`: Si los recordatorios están activos
- `hora_recordatorio`: Hora de recordatorio
- `notas_por_pagina`: Cantidad de notas por página

---

### 4.7 Dashboard y Reportes

#### 4.7.1 Dashboard Principal

KPIs en tiempo real:
- Leads activos (prospecto + negociación)
- Presupuestos pendientes (estado `enviado`)
- Instalaciones programadas (próximos 7 días)
- Clientes activos

Secciones adicionales:
- **Banner urgente**: Seguimientos del día + presupuestos que vencen hoy
- **Alertas del día**: Resumen de seguimientos, presupuestos, instalaciones, revisiones
- **Leads en negociación**: Leads con presupuesto enviado
- **Seguimientos del día**: Tareas automáticas para hoy

#### 4.7.2 Planificación Diaria

- Reuniones del día
- Seguimientos programados para hoy
- Tareas del usuario (CRUD con toggle completar)

#### 4.7.3 Calendario

Vista mensual + semanal unificada con eventos de:
- Reuniones
- Instalaciones programadas
- Seguimientos
- Revisiones
- Solicitudes de video

#### 4.7.4 Reportes

| Reporte | Métricas |
|---|---|
| **Ventas** | Leads por estado, leads por canal, presupuestos por estado, monto total aceptado |
| **Operaciones** | Proyectos por estado, instalaciones próximos 7 días, equipos en stock |
| **Experiencia** | Solicitudes video pendientes, revisiones pendientes, referencias totales |

Exportación CSV disponible con formato `reporte-trabajo-YYYY-MM-DD.csv`.

---

### 4.8 Notificaciones y Alertas Proactivas

**Notificaciones** (dropdown en header, refresh cada 5 min):
- Seguimientos pendientes para hoy
- Presupuestos que vencen hoy
- Presupuestos por vencer (7 días)
- Instalaciones próximas (7 días)
- Revisiones pendientes

**Alertas proactivas** (toast al entrar, cooldown 1 hora):
- Mismas categorías que notificaciones
- Aparecen como toasts con links directos a la sección correspondiente

---

### 4.9 Búsqueda Global

Buscador con `⌘K` / `Ctrl+K` que busca en:

| Contexto Trabajo | Contexto Personal |
|---|---|
| Leads (nombre, empresa, email) | Tareas personales |
| Clientes | Eventos personales |
| Presupuestos (número) | Notas personales |
| Proyectos (nombre, dirección) | — |

Resultados con links directos a cada entidad.

---

### 4.10 Internacionalización (i18n)

Sistema ligero con soporte para **español (es)** y **english (en)**.

- Alcance actual: pantalla de login y errores de autenticación (19 strings + 5 errores mapeados)
- Persistido en `localStorage` con migración de claves legacy
- Toggle visible en header de login y dashboard

---

## 5. Base de Datos — Schema Completo

### 5.1 Tablas (22 total)

| # | Tabla | Registros típicos | RLS |
|---|---|---|---|
| 1 | `leads` | Cientos | Authenticated |
| 2 | `presupuestos` | Cientos | Authenticated |
| 3 | `seguimientos` | Miles | Authenticated |
| 4 | `clientes` | Decenas | Authenticated |
| 5 | `reuniones` | Decenas | Authenticated |
| 6 | `proyectos` | Decenas | Authenticated |
| 7 | `activos` | Cientos | Authenticated |
| 8 | `instalaciones` | Decenas | Authenticated |
| 9 | `solicitudes_video` | Decenas | Authenticated |
| 10 | `revisiones` | Decenas | Authenticated |
| 11 | `referencias` | Decenas | Authenticated |
| 12 | `profiles` | Pocos | Own profile |
| 13 | `tareas` | Cientos | Own user |
| 14 | `user_manager` | 1 | Read-only |
| 15 | `user_manager_members` | Pocos | Read-only |
| 16 | `personal_tareas` | Cientos | Member |
| 17 | `personal_eventos` | Decenas | Member |
| 18 | `personal_notas` | Decenas | Member |
| 19 | `app_config` | Decenas | Context-based |
| 20 | `chat_sessions` | Pocos | Own user |
| 21 | `chat_mensajes` | Miles | Own user |

### 5.2 Vista

- **`v_instalaciones_pendientes`**: Proyectos pendientes/programados/atrasados con datos de cliente y conteo de equipos. `SECURITY INVOKER` para respetar RLS.

### 5.3 Funciones PostgreSQL

| Función | Propósito |
|---|---|
| `handle_new_user()` | Trigger: crea profile automáticamente al registrar usuario |
| `set_updated_at()` | Trigger: actualiza `updated_at` automáticamente en UPDATE |
| `is_member_of_user_manager(uuid)` | Verifica membresía en user_manager para RLS de personal_* |
| `app_config_allow(text)` | RLS: admin para 'trabajo', member para 'personal' |

### 5.4 Triggers

| Trigger | Tabla | Acción |
|---|---|---|
| `on_auth_user_created` | `auth.users` | Inserta profile |
| `set_updated_at` | 17 tablas | Actualiza `updated_at` automáticamente |

---

## 6. API Routes

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/api/chat` | POST | Sesión | Chat IA con streaming (text/plain) |
| `/api/agent` | POST | Sesión | Agente IA (JSON, soporta imágenes) |
| `/api/chat/history` | GET | Sesión | Historial de chat del usuario |
| `/api/leads` | GET | Sesión | Lista de leads |
| `/api/clientes` | GET | Sesión | Lista de clientes |
| `/api/proyectos` | GET | Sesión | Lista de proyectos |
| `/api/dolar-oficial` | GET | Pública | Cotización USD/ARS (cache 5 min) |
| `/api/webhook/whatsapp` | POST | Pública | Webhook Evolution API para WhatsApp |
| `/api/cron/seguimientos` | GET | CRON_SECRET | Procesa seguimientos pendientes (diario 08:00) |
| `/api/auth/deny` | GET | — | Mata sesión de emails no autorizados |
| `/auth/callback` | GET | — | Callback OAuth |

---

## 7. Páginas de la Aplicación

### Auth (sin sidebar)

| Ruta | Componentes | Descripción |
|---|---|---|
| `/` | Landing page | Redirige a dashboard si autenticado |
| `/login` | Login form, OAuth buttons, LocaleToggle, ThemeToggle | Email/password + Google/Microsoft/Apple |
| `/forgot-password` | Email form | Recuperación de contraseña |

### Dashboard (con sidebar)

| Ruta | Componentes clave | Descripción |
|---|---|---|
| `/dashboard` | StatsCards, AlertasDelDia, BannerUrgente | Vista general con KPIs |
| `/dashboard/elegir` | Context selector | Elegir Trabajo o Personal |
| `/dashboard/leads` | LeadsTable, LeadForm, acciones rápidas | Gestión de leads |
| `/dashboard/presupuestos` | PresupuestosTable, PresupuestoForm | Gestión de presupuestos |
| `/dashboard/clientes` | ClientesTable | Lista de clientes convertidos |
| `/dashboard/operaciones` | Tabs: proyectos, activos, instalaciones | Gestión operativa |
| `/dashboard/instalaciones` | InstalacionesPendientes | Instalaciones pendientes |
| `/dashboard/planificacion` | Reuniones, seguimientos, tareas del día | Planificación diaria |
| `/dashboard/calendario` | CalendarioView (Calendar + week strip) | Calendario unificado |
| `/dashboard/experiencia` | Tabs: video, revisiones, referencias | Post-venta |
| `/dashboard/reportes` | Charts (Recharts), filtros, CSV export | Reportes y métricas |
| `/dashboard/configuracion` | Admin config, profile form | Solo admins |
| `/dashboard/chat` | Chat UI con streaming | Chat con agente IA |
| `/dashboard/personal` | Personal hub | Resumen personal |
| `/dashboard/personal/tareas` | Tareas CRUD | Tareas personales |
| `/dashboard/personal/calendario` | PersonalCalendarioView | Calendario personal |
| `/dashboard/personal/notas` | Notas CRUD | Notas personales |
| `/dashboard/personal/configuracion` | Config personal | Config del espacio personal |

---

## 8. Variables de Entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Si | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Si | Clave pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Si | Clave service role (bypass RLS, cron, agente) |
| `OPENAI_API_KEY` | Si (para IA) | API key de OpenAI |
| `ALLOWED_USER_EMAILS` | Opcional | Emails permitidos (separados por coma) |
| `CRON_SECRET` | Opcional | Secreto para autenticar cron de Vercel |
| `EVOLUTION_API_URL` | Opcional | URL de Evolution API (WhatsApp) |
| `EVOLUTION_API_KEY` | Opcional | API key de Evolution |
| `EVOLUTION_INSTANCE` | Opcional | Instancia de Evolution |

---

## 9. Flujos Principales

### 9.1 Captación → Conversión

```
Lead (prospecto)
  │
  ├── Reunión agendada
  │
  ├── Presupuesto creado (borrador)
  │     │
  │     └── Enviado al cliente
  │           │
  │           ├── [Auto] Seguimiento d3
  │           ├── [Auto] Seguimiento d7
  │           ├── [Auto] Seguimiento pre-vencimiento
  │           │
  │           ├── Aceptado → Lead "convertido" → Cliente creado
  │           ├── Rechazado → Lead "perdido"
  │           └── Vencido (sin respuesta)
  │
  └── Lead "perdido" (sin interés)
```

### 9.2 Post-venta (Cliente)

```
Cliente creado
  │
  ├── Proyecto creado (con dirección, contacto)
  │     │
  │     ├── Activos asignados (cámaras, chips, teleports)
  │     │
  │     └── Instalación registrada
  │           │
  │           ├── [Auto] Revisión semana 1
  │           ├── [Auto] Revisión mes 1
  │           ├── [Auto] Revisión trimestral
  │           └── [Auto] Revisión semestral
  │
  ├── Solicitud de video → Procesada → Entregada
  │
  └── Referencia → Nuevo lead creado con link
```

### 9.3 WhatsApp (Automático)

```
Mensaje entrante (Evolution webhook)
  │
  ├── Detectar intención (LangChain)
  │     │
  │     ├── crear_lead → Auto-crear lead + responder
  │     ├── consultar_* → Buscar en DB + responder
  │     └── otro → Respuesta conversacional
  │
  └── Imagen adjunta → OCR/Análisis + respuesta
```

---

## 10. Seguridad

| Capa | Mecanismo |
|---|---|
| **Autenticación** | Supabase Auth (JWT, cookies httpOnly) |
| **Autorización** | 3 roles (`admin`, `usuario`, `viewer`) + RLS en todas las tablas |
| **Email allowlist** | `ALLOWED_USER_EMAILS` en middleware |
| **Registro cerrado** | `/register` redirige a `/login` |
| **API protection** | Todas las API autenticadas excepto públicas |
| **Cron auth** | Bearer token con `CRON_SECRET` |
| **CSRF** | Cookies `SameSite=Lax` |
| **Headers** | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` |
| **DB functions** | `set_config('search_path', '')` para evitar search_path injection |
| **Service role** | Solo usado en cron jobs y herramientas del agente IA |

---

## 11. Observaciones y Deuda Técnica

1. **`chat_sessions` / `chat_mensajes`**: Tienen RLS policies pero no existe migración `CREATE TABLE` en el repo. Fueron creadas fuera del versionado.

2. **`canal_origen` discrepancia**: El schema Zod acepta `'whatsapp'` pero la constraint de la DB solo permite `('reunion','manual','web','referencia')`. Puede causar errores de INSERT al crear leads desde WhatsApp.

3. **TypeScript types desactualizados**: El tipo `Database` en `src/types/database.ts` no incluye las tablas más recientes (`tareas`, `user_manager`, `personal_*`, `app_config`, `chat_*`) ni las columnas agregadas (`link_reunion`, `presupuesto_estimado_moneda`).

4. **i18n limitado**: Solo cubre la pantalla de login. El resto de la app está en español hardcodeado.

5. **Tests limitados**: Solo existen tests para validaciones Zod y un test de accesibilidad. No hay tests de integración ni E2E.

---

## 12. Infraestructura de Deployment

| Aspecto | Configuración |
|---|---|
| **Hosting** | Vercel |
| **Build** | Next.js 16 con Turbopack |
| **Cron** | Vercel Cron: `/api/cron/seguimientos` diario 08:00 |
| **Cache** | Static assets: 1 año immutable. API privadas: `Cache-Control: private, no-cache` |
| **DB** | Supabase Cloud (PostgreSQL) |
| **WhatsApp** | Evolution API (self-hosted o cloud) |
| **AI** | OpenAI API (GPT-4o / GPT-4o-mini) |
