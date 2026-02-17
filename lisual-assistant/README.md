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

## Fases

1. **Fase 0** ✓ Setup, estructura, Supabase client
2. **Fase 1** ✓ Migraciones SQL, Auth, Dashboard Ventas, CRUD Leads/Presupuestos
3. **Fase 2** ✓ Operaciones, instalaciones
4. **Fase 3** ✓ Experiencia al cliente
5. **Fase 4** ✓ IA, WhatsApp, Cron seguimientos
6. **Fase 5** ✓ Reportes y métricas
