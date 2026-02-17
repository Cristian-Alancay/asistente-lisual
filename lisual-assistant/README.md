# Asistente Lisual

Asistente personal web para gestión de ventas, operaciones y experiencia al cliente.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **shadcn/ui**
- **Supabase** (PostgreSQL, Auth)
- **Vercel AI SDK** (Fase 4)

## Requisitos

- Node.js 20.9+
- npm 10+

## Instalación

```bash
npm install
cp .env.example .env.local
# Editar .env.local con tus claves de Supabase
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

```
src/
  app/
    (auth)/          # Login, registro
    (dashboard)/     # Dashboard y secciones
    api/             # Webhooks, cron, chat
  components/
    ui/              # shadcn
    dashboard/
  lib/
    supabase/
  types/
```

## Migraciones Supabase

Ejecutar en el proyecto Supabase:

```bash
npx supabase db push
```

O aplicar manualmente los archivos en `supabase/migrations/`.

## Seguridad y permisos

Solo 2 usuarios tienen acceso (Cristian Alancay, Eliana Corraro). Sin registro público.

- **Allowlist**: en `.env.local` definí `ALLOWED_USER_EMAILS=correo1@...,correo2@...`
- **Deshabilitar registro en Supabase**: Dashboard → Authentication → Providers → Email → desactivar "Enable Sign Up" para que nadie pueda darse de alta ni por API
- Detalle: [docs/PERMISOS.md](docs/PERMISOS.md)

## Fases

1. **Fase 0** ✓ Setup, estructura, Supabase client
2. **Fase 1** ✓ Migraciones SQL, Auth, Dashboard Ventas, CRUD Leads/Presupuestos
3. **Fase 2** ✓ Operaciones, instalaciones
4. **Fase 3** ✓ Experiencia al cliente
5. **Fase 4** ✓ IA, WhatsApp, Cron seguimientos
6. **Fase 5** ✓ Reportes y métricas
7. **Fase 6** ✓ Permisos, roles, allowlist, perfiles (correos/teléfonos), MCP
8. **Fase 7** ✓ Mejoras M2–M5 + Fase 6 funcional
   - CRUD presupuestos, calendario, configuración
   - Dashboard leads negociación, seguimientos día
   - Reportes con gráficos Recharts, filtros por período, exportar CSV
   - Chat con historial persistente, nueva conversación
   - Notificaciones (seguimientos, vencimientos, instalaciones, revisiones)
   - Búsqueda global (leads, clientes, presupuestos, proyectos)
   - Calendario con vista semana actual
   - Sesiones de chat (tabla `chat_sessions`)

## API principales

| Ruta | Descripción |
|------|-------------|
| `/api/chat` | Chat con IA (streaming) |
| `/api/chat/history` | Historial de mensajes |
| `/api/agent` | Agente con herramientas |
| `/api/webhook/whatsapp` | Webhook Evolution API |
| `/api/cron/seguimientos` | Cron seguimientos D3/D7 |
