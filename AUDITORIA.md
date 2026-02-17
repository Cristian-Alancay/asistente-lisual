# Auditoría – Asistente Lisual

**Fecha:** 2026-02-17  
**Scope:** Deploy Vercel, Supabase, código, testing

---

## 1. Resumen ejecutivo

| Área | Estado | Acción requerida |
|------|--------|------------------|
| Build Next.js local | ✓ OK | Ninguna |
| Supabase (MCP) | ✓ OK | Ninguna |
| Deploy Vercel | ✓ OK | Proyecto unificado en raíz |
| Tests | Parcial | Scripts añadidos |
| Código | ✓ OK | Advertencias menores |

---

## 2. Vercel

**Proyecto unificado en la raíz:** Todo el código está en la raíz del repo (sin subcarpeta `lisual-assistant`). Vercel construye desde la raíz; no hace falta configurar Root Directory.

---

## 3. Supabase (MCP)

- **Proyecto:** https://ymoatplfykkcibuaplhd.supabase.co
- **Tablas:** leads, clientes, proyectos, presupuestos, reuniones, seguimientos, instalaciones, activos, revisiones, referencias, solicitudes_video, tareas, chat_mensajes, chat_sessions, profiles
- **RLS:** Habilitado en todas las tablas
- **App:** `.env.local` usa la misma URL y anon key → conexión correcta

---

## 4. Build local

- **Comando:** `npm run build` (desde la raíz)
- **Resultado:** ✓ Compila OK, 29 rutas generadas
- **Advertencia:** `middleware` deprecated → migrar a `proxy` (Next.js 16+)

---

## 5. Rutas de la app

| Ruta | Tipo | Notas |
|------|------|-------|
| `/` | Dinámica | Landing, redirige a /login si no auth |
| `/login`, `/register`, `/forgot-password` | Estática | Auth |
| `/dashboard/*` | Dinámica | Protegido por middleware |
| `/api/*` | API | Agent, chat, leads, cron, etc. |

---

## 6. Middleware

- Actualiza sesión Supabase
- Redirige no autenticados a `/login`
- Allowlist de emails (`ALLOWED_USER_EMAILS`)
- Rutas admin protegidas por rol en `profiles`

---

## 7. Variables de entorno

Obligatorias para deploy:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Opcionales: `ALLOWED_USER_EMAILS`, Evolution API, `CRON_SECRET`.

---

## 8. Scripts creados

| Script | Comando | Descripción |
|--------|---------|-------------|
| vercel:check | `npm run vercel:check` | Valida estructura para Vercel |
| vercel:test | `npm run vercel:test` | Check + build |
| test:all | `npm run test:all` | Check + Vitest + build (pre-deploy completo) |
| dev | `npm run dev` | Servidor local |
| build | `npm run build` | Build Next.js |

---

## 9. Evaluación de código

### Middleware
- **Archivo:** `src/middleware.ts` → llama a `updateSession` en `lib/supabase/middleware.ts`
- **Flujo:** Auth Supabase, redirect no-auth a `/login`, allowlist de emails, rutas admin por rol
- **Advertencia Next.js 16:** convención `middleware` deprecated → migrar a `proxy` (futuro)

### API Routes
- `/api/agent`, `/api/chat`, `/api/leads`, `/api/clientes`, `/api/proyectos`, `/api/webhook/whatsapp`, `/api/cron/seguimientos`, `/auth/callback`, `/api/auth/deny`
- Todas dinámicas (ƒ), requieren vars de entorno para Supabase/OpenAI/Evolution

### 404 en Vercel
- El 404 **no** viene del código de la app (no hay custom 404 handler que falle)
- Vercel sirve `/404.html` porque **no encuentra la app** cuando Root Directory está mal configurado
- Con Root Directory = `lisual-assistant`, la app se construye y sirve correctamente

---

## 10. Recomendaciones

1. **Vercel:** Proyecto unificado en raíz; no hace falta Root Directory.
2. **Middleware:** Planear migración de `middleware` a `proxy` (Next.js 16).
3. **Supabase:** Revisar advisors de seguridad (SECURITY DEFINER, leaked password protection).
4. **Tests:** Expandir cobertura con Vitest en módulos críticos.
