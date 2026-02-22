# PWR — Project Work Report

## Assistant Cristian Alancay

> Reporte integral del proyecto: producto, arquitectura, estado actual, auditorías y plan.  
> Fecha: 2026-02-21 | Versión: 1.0

---

## Tabla de Contenido

1. [Ficha del Proyecto](#1-ficha-del-proyecto)
2. [Resumen Ejecutivo](#2-resumen-ejecutivo)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Arquitectura](#4-arquitectura)
5. [Métricas del Codebase](#5-métricas-del-codebase)
6. [Historial de Desarrollo](#6-historial-de-desarrollo)
7. [PRD — Requisitos del Producto](#7-prd--requisitos-del-producto)
8. [Base de Datos](#8-base-de-datos)
9. [Seguridad](#9-seguridad)
10. [Auditorías Realizadas](#10-auditorías-realizadas)
11. [Testing](#11-testing)
12. [Documentación del Proyecto](#12-documentación-del-proyecto)
13. [Deuda Técnica y Riesgos](#13-deuda-técnica-y-riesgos)
14. [Infraestructura y Deploy](#14-infraestructura-y-deploy)
15. [Roadmap](#15-roadmap)

---

## 1. Ficha del Proyecto

| Campo | Valor |
|---|---|
| **Nombre** | Assistant Cristian Alancay |
| **Tipo** | CRM + Asistente IA full-stack |
| **Industria** | Video-seguridad (Lisual) |
| **Repositorio** | `github.com/Cristian-Alancay/asistente-lisual` |
| **Rama principal** | `main` |
| **Usuarios autorizados** | 2 (Cristian Alancay, Eliana Corraro) |
| **Registro público** | Deshabilitado |
| **Hosting** | Vercel |
| **Base de datos** | Supabase (PostgreSQL) |
| **IA** | LangChain + OpenAI (GPT-4o) |
| **WhatsApp** | Evolution API |
| **Inicio desarrollo** | 2026-02-17 |
| **Último deploy** | 2026-02-21 |
| **Commits totales** | 6 |

---

## 2. Resumen Ejecutivo

**Assistant Cristian Alancay** es una plataforma CRM con asistente de inteligencia artificial diseñada para Lisual, empresa de video-seguridad. Gestiona el ciclo completo: captación de leads, presupuestos, conversión a clientes, operaciones (proyectos, activos, instalaciones), y experiencia post-venta (revisiones, solicitudes de video, referencias).

Opera en **dos contextos**:
- **Trabajo (Lisual)**: Pipeline comercial completo con automatizaciones
- **Personal (Cristian Alancay)**: Tareas, calendario y notas privadas

El agente de IA (LangChain ReAct + GPT-4o) está disponible via chat web y WhatsApp, capaz de consultar/crear datos y procesar imágenes (OCR + análisis visual).

---

## 3. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| UI | React + Radix UI + shadcn/ui | React 19.2.3 |
| Estilos | Tailwind CSS | 4 |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) | supabase-js 2.96 |
| IA / Agente | LangChain + OpenAI | langchain 1.2.24, gpt-4o |
| WhatsApp | Evolution API | — |
| Formularios | React Hook Form + Zod | RHF 7.71, Zod 4.3 |
| Charts | Recharts | — |
| Testing | Vitest + Testing Library + vitest-axe | Vitest 4 |
| Deploy | Vercel (auto-build desde main) | — |
| Linting | ESLint + eslint-plugin-jsx-a11y | — |

---

## 4. Arquitectura

### 4.1 Diagrama General

```
┌──────────────────────────────────────────────────────────────────┐
│                          VERCEL                                   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                 Next.js 16 (App Router)                    │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌────────────┐  ┌───────────────────────┐  │  │
│  │  │ 22 Pages │  │ 10 API     │  │   17 Server Actions   │  │  │
│  │  │  (SSR)   │  │  Routes    │  │  (mutations + queries) │  │  │
│  │  └────┬─────┘  └─────┬──────┘  └──────────┬────────────┘  │  │
│  │       │               │                    │               │  │
│  │       └───────────────┼────────────────────┘               │  │
│  │                       │                                    │  │
│  │               ┌───────┴────────┐                           │  │
│  │               │ Supabase SSR   │                           │  │
│  │               │ Client (RLS)   │                           │  │
│  │               └───────┬────────┘                           │  │
│  └───────────────────────┼────────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────────────────┼────────────────────────────────────┐  │
│  │           LangChain ReAct Agent (GPT-4o)                   │  │
│  │                                                            │  │
│  │  Tools: list_leads, search_leads, create_lead, get_lead,  │  │
│  │         list_presupuestos, ocr_image, analyze_image        │  │
│  │                                                            │  │
│  │  Service Role Client (bypass RLS)                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────┐  ┌────────────────────────────────┐  │
│  │ Vercel Cron (08:00 AM) │  │ Middleware (Auth + Routes)     │  │
│  │ /api/cron/seguimientos │  │ Email allowlist, role check    │  │
│  └────────────────────────┘  └────────────────────────────────┘  │
└──────────┬─────────────────────────────────┬─────────────────────┘
           │                                 │
   ┌───────┴───────────┐           ┌─────────┴──────────┐
   │     Supabase      │           │   Evolution API    │
   │  PostgreSQL + Auth │           │   (WhatsApp)      │
   │  RLS + 22 tablas  │           │   Webhook + Send  │
   │  14 migraciones   │           └────────────────────┘
   │  4 funciones PG   │
   │  17 triggers       │
   └────────────────────┘
```

### 4.2 Flujo de Request

```
Browser → Vercel Edge (Middleware) → Next.js Server
  │                                      │
  ├── Auth check ──────────────────────► Supabase Auth (JWT cookies)
  ├── Role check (admin/usuario/viewer)
  ├── Email allowlist check
  │
  ├── Page (SSR) ──────────────────────► Server Actions → Supabase (RLS)
  ├── API Route ───────────────────────► Supabase / LangChain / External
  └── Chat (streaming) ───────────────► LangChain Agent → OpenAI → Supabase
```

### 4.3 Estructura de Directorios

```
src/
├── app/
│   ├── (auth)/           # Login, register, forgot-password
│   ├── (dashboard)/      # Dashboard + 16 sub-páginas
│   │   └── dashboard/
│   │       ├── leads/    presupuestos/    clientes/
│   │       ├── operaciones/  instalaciones/  calendario/
│   │       ├── planificacion/  experiencia/  reportes/
│   │       ├── configuracion/  chat/  elegir/
│   │       └── personal/      # tareas/ calendario/ notas/ configuracion/
│   └── api/              # 10 route handlers
├── components/
│   ├── dashboard/        # Shell, sidebar, search, notifications
│   ├── forms/            # Lead form, presupuesto form
│   └── ui/               # 19+ shadcn/ui primitives
├── contexts/             # LocaleContext (ES/EN)
├── hooks/                # useIsMobile
├── lib/
│   ├── actions/          # 17 server action files
│   ├── langchain/        # Agent, tools, intent, multimedia
│   ├── supabase/         # Server/client/middleware clients
│   ├── validations/      # Zod schemas + tests
│   ├── i18n/             # Translations (login)
│   └── *.ts              # Auth, utils, storage, headers
├── types/                # Database types, auth types
supabase/
├── migrations/           # 14 SQL migrations
└── scripts/              # Seed scripts
docs/                     # 11 documentation files
```

---

## 5. Métricas del Codebase

| Métrica | Valor |
|---|---|
| **Líneas de código** (TS + TSX) | 14,359 |
| **Archivos .tsx** | 100 |
| **Archivos .ts** | 62 |
| **Total archivos fuente** | 162 |
| **Páginas** | 22 |
| **Componentes** | 40 |
| **Server Actions** | 17 archivos |
| **API Routes** | 10 |
| **Migraciones SQL** | 14 |
| **Tablas en DB** | 22 (+ 1 vista) |
| **Funciones PostgreSQL** | 4 |
| **Triggers** | 17 (auto updated_at) + 1 (profile creation) |
| **RLS Policies** | Todas las tablas con RLS habilitado |
| **Tests** | 4 archivos, ~23 tests |
| **Dependencias (prod)** | ~30 packages |
| **Dependencias (dev)** | ~15 packages |

---

## 6. Historial de Desarrollo

### 6.1 Timeline de Commits

| Fecha | Hash | Descripción |
|---|---|---|
| 2026-02-17 | `13c6ed9` | Initial commit: proyecto lisual-assistant |
| 2026-02-17 | `3482e57` | Commit general: docs Vercel, seguridad, notificaciones, roles, clientes-table, integraciones, multimedia, tests |
| 2026-02-17 | `acaa9b8` | Auditoría Vercel: scripts vercel:check, vercel:test, test:all |
| 2026-02-17 | `367b5b3` | Unificar proyecto en raíz (eliminar subdirectorio lisual-assistant) |
| 2026-02-21 | `334b48f` | Simplificación general: unificar IA bajo LangChain, eliminar boilerplate |
| 2026-02-21 | `a61ce2c` | Fix hydration mismatch: diferir new Date() a useEffect |

### 6.2 Fases de Desarrollo (completadas)

| Fase | Alcance | Estado |
|---|---|---|
| **Fase 0** | Autenticación Supabase + estructura base | Completada |
| **Fase 1** | CRUD Leads + Presupuestos | Completada |
| **Fase 2** | Chat IA (LangChain + streaming) | Completada |
| **Fase 3** | WhatsApp (Evolution API webhook + envío) | Completada |
| **Fase 4** | Operaciones (proyectos, activos, instalaciones) | Completada |
| **Fase 5** | Experiencia al cliente (video, revisiones, referencias) | Completada |
| **Fase 6** | Reportes, roles, búsqueda global | Completada |
| **Fase 7** | Contexto personal (tareas, calendario, notas) | Completada |

### 6.3 Optimizaciones Realizadas (2026-02-21)

| Área | Antes | Después |
|---|---|---|
| **Stack IA** | Dual (Vercel AI SDK + LangChain) | Unificado bajo LangChain |
| **API Routes** (leads/clientes/proyectos) | 17 líneas c/u, duplicadas | 3 líneas c/u via `createGetRoute` factory |
| **Client Hooks** (useLeads/useClientes/useProyectos) | ~24 líneas c/u, duplicadas | ~8 líneas c/u via `useFetchList` genérico |
| **Server Actions** (mutations) | Boilerplate repetido (auth + client + revalidate) | `withEditAuth` wrapper centralizado |
| **`updated_at` manual** | 15 asignaciones manuales en código | Trigger PostgreSQL automático en 17 tablas |
| **`extractContent` IA** | Duplicado en 3 archivos | Utilitario compartido |
| **Dependencias** | `ai`, `@ai-sdk/openai`, `@ai-sdk/react`, `date-fns` | Removidas (unused) |
| **Hydration errors** | `new Date()` en render, sin suppress en body | Deferred a useEffect + suppressHydrationWarning |

---

## 7. PRD — Requisitos del Producto

> Documento completo en [`docs/PRD.md`](./PRD.md)

### 7.1 Módulos Funcionales

| Módulo | Entidades | Funciones clave |
|---|---|---|
| **CRM / Ventas** | Leads, Presupuestos, Seguimientos, Reuniones, Clientes | Pipeline prospecto→conversión, seguimientos automáticos, cotización multi-moneda |
| **Operaciones** | Proyectos, Activos, Instalaciones | Gestión de equipos (cámaras, chips, teleports), tracking de instalaciones |
| **Experiencia** | Solicitudes Video, Revisiones, Referencias | Programa de revisiones periódicas, pedidos de video, referrals |
| **Agente IA** | Chat, WhatsApp webhook | 7 tools (CRUD leads, presupuestos, OCR, análisis visual), streaming |
| **Personal** | Tareas, Eventos, Notas | Espacio privado con CRUD completo |
| **Dashboard** | Stats, Alertas, Planificación, Calendario, Reportes | KPIs en tiempo real, alertas proactivas, CSV export |

### 7.2 Pipeline de Ventas

```
Lead (prospecto)
  ├── Reunión agendada
  ├── Presupuesto (borrador → enviado)
  │     ├── [Auto] Seguimiento d3
  │     ├── [Auto] Seguimiento d7
  │     ├── [Auto] Seguimiento pre-vencimiento
  │     ├── Aceptado → Cliente → Proyecto → Instalación → Revisiones
  │     ├── Rechazado → Lead perdido
  │     └── Vencido
  └── Lead perdido (sin interés)
```

### 7.3 Agente IA

| Aspecto | Detalle |
|---|---|
| Motor | LangChain ReAct Agent |
| Modelo principal | GPT-4o (temperatura 0.3) |
| Modelo visión | GPT-4o (temperatura 0.2) |
| Tools | `list_leads`, `search_leads`, `create_lead`, `get_lead`, `list_presupuestos`, `ocr_image`, `analyze_image` |
| Canales | Chat web (streaming), API JSON, WhatsApp webhook |
| Clasificación | Detección de intención con confianza 0-1 |
| Acceso DB | Service role (bypass RLS) para tools |

### 7.4 Usuarios y Roles

| Rol | Permisos | Usuarios |
|---|---|---|
| `admin` | Acceso total + configuración global | Cristian Alancay |
| `usuario` | CRUD completo excepto configuración | Eliana Corraro |
| `viewer` | Solo lectura | — (sin asignar) |

---

## 8. Base de Datos

### 8.1 Esquema de Tablas (22)

**Ventas:**
| Tabla | Columnas clave | Relaciones |
|---|---|---|
| `leads` | nombre, empresa, email, telefono, canal_origen, estado, presupuesto_estimado, moneda, link_reunion | self-ref (referred_by) |
| `presupuestos` | lead_id, numero, fecha_emision, vigencia_hasta, items (JSONB), total, moneda, estado | → leads |
| `seguimientos` | presupuesto_id, tipo (d3/d7/pre_vencimiento), programado_para, ejecutado_at | → presupuestos |
| `reuniones` | lead_id, fecha_hora, duracion_min, notas, google_event_id | → leads |
| `clientes` | lead_id (unique), id_lisual_pro, fecha_pago, monto_pagado | → leads |

**Operaciones:**
| Tabla | Columnas clave | Relaciones |
|---|---|---|
| `proyectos` | cliente_id, nombre, direccion, fecha_instalacion, estado | → clientes |
| `activos` | proyecto_id, tipo (camara/chip/teleport), codigo, numero_serie, estado | → proyectos |
| `instalaciones` | proyecto_id, tecnico_asignado, fecha_inicio/fin, checklist, fotos_urls | → proyectos |

**Experiencia:**
| Tabla | Columnas clave | Relaciones |
|---|---|---|
| `solicitudes_video` | cliente_id, fecha_hora_video, camara_id, motivo, estado, link_descarga | → clientes, → activos |
| `revisiones` | cliente_id, tipo (semana1/mes1/trimestral/semestral), programada_para | → clientes |
| `referencias` | cliente_referidor_id, lead_referido_id, incentivo | → clientes, → leads |

**Auth & Sistema:**
| Tabla | Columnas clave | RLS |
|---|---|---|
| `profiles` | email, full_name, role, additional_emails, phone_1, phone_2 | Own profile |
| `tareas` | usuario_id, titulo, completada, prioridad, fecha | Own user |
| `chat_sessions` / `chat_mensajes` | usuario_id, role, content | Own user |
| `user_manager` / `user_manager_members` | nombre, slug, rol (admin/member) | Read-only |
| `personal_tareas` / `personal_eventos` / `personal_notas` | user_manager_id, titulo, contenido | Member |
| `app_config` | contexto (trabajo/personal), key, value | Context-based |

### 8.2 Vista

- **`v_instalaciones_pendientes`**: Proyectos pendientes/programados/atrasados con datos de cliente y equipos. `SECURITY INVOKER`.

### 8.3 Funciones y Triggers

| Función | Propósito |
|---|---|
| `handle_new_user()` | Crea profile automáticamente al registrar usuario |
| `set_updated_at()` | Trigger en 17 tablas para auto-actualizar `updated_at` |
| `is_member_of_user_manager(uuid)` | RLS para personal_* (verifica membresía) |
| `app_config_allow(text)` | RLS: admin para 'trabajo', member para 'personal' |

### 8.4 Migraciones (14)

| # | Migración | Alcance |
|---|---|---|
| 1 | `001_initial_schema` | leads, presupuestos, seguimientos, clientes, reuniones |
| 2 | `002_profiles_roles` | profiles, handle_new_user trigger |
| 3 | `003_chat_sessions_rls` | Chat sessions RLS |
| 4 | `004_operaciones` | proyectos, activos, instalaciones, v_instalaciones_pendientes |
| 5 | `005_experiencia` | solicitudes_video, revisiones, referencias |
| 6 | `006_reportes_indices` | Índices adicionales para reportes |
| 7 | `20260217200000_tareas` | Tabla tareas (diarias por usuario) |
| 8 | `20260217215625_fix_view` | Fix security invoker en vista |
| 9 | `20260217215629_fix_handle_new_user` | Fix search_path en función |
| 10 | `20260217221000_leads_link_reunion` | Columnas link_reunion + presupuesto_estimado_moneda |
| 11 | `20260218000000_user_manager_personal` | user_manager, members, personal_tareas/eventos/notas |
| 12 | `20260218100000_app_config` | Tabla app_config |
| 13 | `20260218110000_app_config_contexto` | Rename 'lisual' → 'trabajo' en app_config |
| 14 | `20260219000000_audit_rls_performance` | Optimización RLS, índices FK, trigger set_updated_at |

---

## 9. Seguridad

### 9.1 Capas de Seguridad

| Capa | Mecanismo | Estado |
|---|---|---|
| Autenticación | Supabase Auth (JWT, cookies httpOnly) | Activo |
| Autorización | 3 roles + RLS en todas las tablas | Activo |
| Email allowlist | `ALLOWED_USER_EMAILS` en middleware | Activo |
| Registro cerrado | `/register` redirige a `/login` | Activo |
| API protection | Middleware valida sesión en rutas privadas | Activo |
| Cron auth | Bearer token `CRON_SECRET` | Activo |
| CSRF | Cookies `SameSite=Lax` | Activo |
| HTTP headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` | Activo |
| Cache-Control | `private, no-store` en APIs privadas | Activo |
| DB functions | `set_config('search_path', '')` | Activo |
| Storage keys | Prefijo `trabajo_` para evitar colisiones | Activo |

### 9.2 Hallazgos de Auditoría de Seguridad

| Severidad | Hallazgo | Estado |
|---|---|---|
| ERROR | Vista `v_instalaciones_pendientes` con SECURITY DEFINER | **Corregido** → SECURITY INVOKER |
| WARN | `handle_new_user` con search_path mutable | **Corregido** → `set_config('search_path', '')` |
| WARN | Policy de admin en profiles con WITH CHECK siempre true | **Corregido** → role escalation check |
| WARN | Leaked password protection (HaveIBeenPwned) deshabilitada | **Pendiente** |
| INFO | APIs `/api/leads`, `/api/clientes`, `/api/proyectos` sin auth | **Corregido** → middleware auth |
| INFO | APIs sin Cache-Control header | **Corregido** → `private, no-store` |

---

## 10. Auditorías Realizadas

### 10.1 Auditoría Vercel (2026-02-17)

| Aspecto | Resultado |
|---|---|
| Build | OK — 29 rutas generadas |
| Supabase | Conectividad OK, 15 tablas con RLS |
| TypeScript | 0 errores (fix aplicado en proximos-block.tsx) |
| Middleware | Warning: `middleware` convention deprecated en Next.js 16 |
| Scripts creados | `vercel:check`, `vercel:test`, `test:all` |

### 10.2 Auditoría de Sistema (2026-02-17)

| Área | Resultado |
|---|---|
| Migración RLS | Aplicada: 3 FK indexes, auth.uid() optimizado, profiles policy endurecida |
| Tests | Expandidos a 23 (3 utility, 9 lead, 8 presupuesto, 3 a11y) |
| Accesibilidad | ESLint jsx-a11y + vitest-axe configurados |
| Compatibilidad | Chrome, Firefox, Safari, Edge (últimas 2 versiones) |

### 10.3 Auditoría de Cache (2026-02-17)

| Hallazgo | Acción |
|---|---|
| APIs privadas sin auth ni cache headers | Middleware auth + `Cache-Control: private, no-store` |
| API pública (dolar-oficial) sin cache | `s-maxage=300, stale-while-revalidate` |
| Cookie sidebar sin SameSite | `SameSite=Lax` aplicado |
| Storage keys sin prefijo | Prefijo `trabajo_` + migración legacy |

### 10.4 Simplificación de Código (2026-02-21)

| Acción | Impacto |
|---|---|
| Unificar stack IA (eliminar Vercel AI SDK) | -3 dependencias, 1 solo flujo de chat |
| Factory para API routes | 3 archivos de 17→3 líneas |
| Hook genérico `useFetchList` | 3 hooks de 24→8 líneas |
| Wrapper `withEditAuth` | 12 funciones simplificadas |
| Trigger `set_updated_at` | -15 asignaciones manuales |
| Utility `extractContent` | Eliminó duplicación en 3 archivos |
| Fix hydration mismatch | 4 archivos corregidos |

---

## 11. Testing

### 11.1 Estado Actual

| Tipo | Archivos | Tests | Framework |
|---|---|---|---|
| Validación Zod (Lead) | `lead.test.ts` | 7 | Vitest |
| Validación Zod (Presupuesto) | `presupuesto.test.ts` | 8 | Vitest |
| Accesibilidad (a11y) | `accessibility.test.tsx` | 3 | Vitest + vitest-axe |
| Utility | — | 5 | Vitest |
| **Total** | **4 archivos** | **~23 tests** | — |

### 11.2 Cobertura por Área

| Área | Cobertura | Tipo |
|---|---|---|
| Validaciones de formularios | Alta | Unit tests (Zod schemas) |
| Accesibilidad básica | Media | Automated axe tests |
| Server Actions | Ninguna | — |
| API Routes | Ninguna | — |
| Componentes UI | Ninguna | — |
| Flujos E2E | Ninguna | — |
| Agente IA | Ninguna | — |

### 11.3 Herramientas Configuradas

- **Vitest** 4 con configuración en `vitest.config.ts`
- **Testing Library** (React) para render y queries
- **vitest-axe** para accesibilidad automatizada
- **eslint-plugin-jsx-a11y** para linting de accesibilidad
- Setup file: `vitest-setup.ts`

---

## 12. Documentación del Proyecto

| Archivo | Contenido |
|---|---|
| **`docs/PRD.md`** | Product Requirements Document completo (módulos, DB, API, flujos, seguridad) |
| **`docs/PWR.md`** | Este documento — reporte integral del proyecto |
| **`README.md`** | Intro, stack, instalación, fases, estructura |
| **`AUDITORIA.md`** | Auditoría Vercel (build, Supabase, warnings) |
| **`VERCEL.md`** | Guía de deploy en Vercel (env vars, configuración) |
| **`docs/PLAN-LISUAL-CRISTIAN-ALANCAY.md`** | Plan para implementar dual-context (Trabajo/Personal) |
| **`docs/SEGURIDAD.md`** | Auditoría de seguridad Supabase (errores, warnings, fixes) |
| **`docs/PERMISOS.md`** | Sistema de permisos, roles, allowlist, rutas protegidas |
| **`docs/LANGCHAIN-EVALUACION.md`** | Evaluación de integración LangChain (gaps, riesgos, mejoras) |
| **`docs/CHAT-Y-AGENTE-API.md`** | Referencia de las 2 APIs de chat (streaming vs JSON) |
| **`docs/CACHE-AUDIT.md`** | Auditoría de cache y headers de seguridad |
| **`docs/AUDITORIA-SISTEMA.md`** | Auditoría integral (RLS, tests, a11y, compatibilidad) |
| **`docs/ACCESIBILIDAD.md`** | Guía de accesibilidad (herramientas, tests, prácticas) |
| **`docs/COMPATIBILIDAD.md`** | Compatibilidad de navegadores y dispositivos |

---

## 13. Deuda Técnica y Riesgos

### 13.1 Deuda Técnica

| Prioridad | Ítem | Impacto |
|---|---|---|
| **Alta** | TypeScript types (`database.ts`) desactualizados — faltan 10+ tablas y columnas | Errores de tipado silenciosos, autocompletar incompleto |
| **Alta** | `chat_sessions` / `chat_mensajes` sin migración CREATE TABLE en repo | Schema no reproducible desde cero |
| **Alta** | `canal_origen` discrepancia: Zod acepta `'whatsapp'`, DB no | Error de constraint al crear leads desde WhatsApp |
| **Media** | Middleware Next.js 16 deprecation warning | Necesita migración a `proxy` convention |
| **Media** | i18n solo cubre login (19 strings) | Resto de la app en español hardcodeado |
| **Media** | Tests cubren solo validaciones | Sin tests de integración, E2E, ni del agente IA |
| **Baja** | Leaked password protection (HaveIBeenPwned) deshabilitada | Recomendación de Supabase sin aplicar |

### 13.2 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| OpenAI API down / rate limit | Media | Alto (chat y WhatsApp dejan de funcionar) | Fallback a respuesta genérica en WhatsApp ya implementado |
| Evolution API inestable | Media | Medio (seguimientos WhatsApp fallan) | Seguimientos se quedan pendientes, se reintentan en próximo cron |
| Supabase free tier limits | Baja | Alto (DB o auth down) | Monitorear uso; solo 2 usuarios activos |
| Email allowlist omitido | Baja | Alto (acceso no autorizado) | Middleware verifica en cada request |

---

## 14. Infraestructura y Deploy

### 14.1 Configuración Vercel

| Aspecto | Valor |
|---|---|
| Framework | Next.js (auto-detectado) |
| Root Directory | Raíz del repo (vacío) |
| Build command | `npm run build` |
| Output directory | `.next` (default) |
| Node.js | 18+ |

### 14.2 Cron Jobs

| Job | Schedule | Endpoint | Descripción |
|---|---|---|---|
| Seguimientos | Diario 08:00 AM | `/api/cron/seguimientos` | Envía WhatsApp para seguimientos pendientes |

### 14.3 Variables de Entorno

| Variable | Obligatoria | Propósito |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Si | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Si | Clave pública Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Si | Service role (agente IA, cron) |
| `OPENAI_API_KEY` | Si | API OpenAI |
| `ALLOWED_USER_EMAILS` | Recomendada | Emails autorizados (comma-separated) |
| `CRON_SECRET` | Recomendada | Bearer token para cron |
| `EVOLUTION_API_URL` | Opcional | WhatsApp API URL |
| `EVOLUTION_API_KEY` | Opcional | WhatsApp API key |
| `EVOLUTION_INSTANCE` | Opcional | WhatsApp instancia |

### 14.4 Cache Strategy

| Recurso | Cache-Control |
|---|---|
| Static assets (fonts, images) | `public, max-age=31536000, immutable` |
| APIs privadas (leads, clientes, etc.) | `private, no-store` |
| API pública (dolar-oficial) | `s-maxage=300, stale-while-revalidate` |
| Pages (SSR) | No-cache (dynamic rendering) |

---

## 15. Roadmap

### 15.1 Pendientes Inmediatos

- [ ] Actualizar `src/types/database.ts` con todas las tablas y columnas faltantes
- [ ] Crear migración para `chat_sessions` / `chat_mensajes` (actualmente sin CREATE TABLE)
- [ ] Agregar `'whatsapp'` al CHECK constraint de `canal_origen` en leads
- [ ] Habilitar leaked password protection en Supabase Auth
- [ ] Migrar middleware a convention `proxy` de Next.js 16

### 15.2 Mejoras Planificadas

- [ ] Expandir i18n al dashboard completo (no solo login)
- [ ] Tests de integración para Server Actions
- [ ] Tests E2E con Playwright para flujos críticos (login → lead → presupuesto → conversión)
- [ ] Lighthouse CI en pipeline de deploy
- [ ] Monitoreo/observabilidad del agente LangChain (LangSmith o similar)
- [ ] Google Calendar sync (usar `google_event_id` ya existente en reuniones)

### 15.3 Funcionalidades Futuras

- [ ] Dashboard de métricas avanzadas (conversión, tiempo promedio de cierre)
- [ ] Notificaciones push (PWA)
- [ ] Exportación de presupuestos a PDF
- [ ] Integración con facturación (AFIP / facturación electrónica)
- [ ] Multi-tenant (más de un user_manager)
