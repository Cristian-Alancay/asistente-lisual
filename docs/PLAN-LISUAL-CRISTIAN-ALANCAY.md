# Plan: Lisual (laboral) vs Cristian Alancay (personal)

## Actualizaciones según tu indicación

- **Nombre del contexto personal**: en toda la UI se usa **"Cristian Alancay"** (no "Personal").
- **Eliana**: tiene su **propio login** y **acceso completo** a todo: lectura, escritura, consultas, en ambos contextos (Lisual y Cristian Alancay). Mismo nivel de acceso que Cristian; sin restricciones.

---

## Resumen del plan

1. **User Manager**: tabla `user_manager` + `user_manager_members` con los 2 usuarios (Cristian y Eliana). Ambos con acceso total.
2. **Dos contextos en la UI**:
   - **Lisual**: laboral (Dashboard, Ventas, Operaciones, Experiencia, Reportes).
   - **Cristian Alancay**: personal (tareas, calendario, notas compartidos entre ambos).
3. **Selector en sidebar**: "Lisual" | "Cristian Alancay". Rutas: `/dashboard` (Lisual) y `/dashboard/personal` (Cristian Alancay).
4. **Tablas personales**: `personal_tareas`, `personal_eventos`, `personal_notas` (RLS: acceso para ambos usuarios).
5. **Eliana**: rol **admin** con acceso completo (lectura, escritura, consultas, configuración) a Lisual y a Cristian Alancay.

---

## Consideraciones previas a implementar

- **Contexto por defecto tras login**: que al entrar vayan a **Lisual** (laboral). El selector permite cambiar a Cristian Alancay cuando quieran.
- **Persistir último contexto**: guardar en cookie o `localStorage` el último contexto elegido (Lisual / Cristian Alancay) para que al volver a entrar se abra en el mismo.
- **Móvil**: el sidebar ya es un sheet en móvil; el selector "Lisual | Cristian Alancay" debe ser lo primero (o muy visible) para cambiar de contexto sin perderse.
- **RLS**: no hace falta tocar las políticas actuales de las tablas Lisual (leads, presupuestos, etc.). Solo nuevas políticas para `personal_*` que exijan que el usuario esté en `user_manager_members`. El acceso a la app puede seguir controlado por la allowlist actual; `user_manager_members` sirve como capa extra o futura fuente de verdad.
- **Rutas internas**: en código las rutas pueden seguir siendo `/dashboard/personal/*`; solo en la UI se muestra el nombre "Cristian Alancay" (no "Personal").

---

## Fases de implementación

### Fase 1 – Base de datos

- **Objetivo**: Backend listo; sin cambios en la UI.
- **Tareas**:
  - Crear migración(es) en `supabase/migrations/`:
    - Tablas: `user_manager` (id, nombre, slug, created_at), `user_manager_members` (user_manager_id, user_id, rol), `personal_tareas`, `personal_eventos`, `personal_notas` con estructura acorde al plan (tareas: titulo, completada, etc.; eventos: titulo, fecha_inicio, fecha_fin, etc.; notas: titulo, contenido, etc.).
    - RLS en `personal_*`: política que permita acceso solo si `auth.uid()` está en `user_manager_members` del user_manager asociado (o un único user_manager por ahora).
    - Seed: 1 fila en `user_manager`, 2 en `user_manager_members` (Cristian y Eliana); vincular por `user_id` con `auth.users`/`profiles`.
  - Asegurar que Eliana tenga rol `admin` en `profiles` (seed o script).
- **Archivos**: solo `supabase/migrations/*.sql` (y opcional script de seed).

---

### Fase 2 – Selector de contexto y sidebar

- **Objetivo**: Usuario puede cambiar entre Lisual y Cristian Alancay; menú correcto por contexto; Cristian Alancay con layout y página mínima.
- **Tareas**:
  - **Detección de contexto**: en el layout o en un helper, determinar contexto por pathname: `/dashboard` y rutas que no empiecen por `/dashboard/personal` = Lisual; `/dashboard/personal` y subrutas = Cristian Alancay. Exponer contexto (ej. `"lisual" | "personal"`) vía React context o props si hace falta.
  - **Sidebar** (`src/components/dashboard/app-sidebar.tsx`):
    - Añadir bloque superior con selector "Lisual" | "Cristian Alancay" (links a `/dashboard` y `/dashboard/personal`); destacado visualmente (ej. primer grupo).
    - Menú dinámico según contexto: en **Lisual** mantener grupos actuales (General, Ventas, Operaciones, Experiencia, Reportes) + Chat + Configuración; en **Cristian Alancay** mostrar solo: Tareas, Calendario, Notas, Chat, Configuración (enlaces a `/dashboard/personal/tareas`, `/dashboard/personal/calendario`, `/dashboard/personal/notas`, `/dashboard/chat`, `/dashboard/personal/configuracion`).
  - **Layout y página mínima** para Cristian Alancay:
    - Crear `src/app/(dashboard)/dashboard/personal/layout.tsx` si hace falta (o reutilizar el layout del dashboard y que la detección de contexto siga por ruta).
    - Crear `src/app/(dashboard)/dashboard/personal/page.tsx`: página de bienvenida / resumen mínima (texto tipo "Cristian Alancay" y enlaces a Tareas, Calendario, Notas).
- **Archivos**: `src/components/dashboard/app-sidebar.tsx`, `src/app/(dashboard)/layout.tsx` (pasar contexto al sidebar si se usa context), nuevas rutas bajo `dashboard/personal/`.

---

### Fase 3 – Páginas Cristian Alancay y búsqueda por contexto

- **Objetivo**: CRUD de tareas, calendario y notas personales; búsqueda global (⌘K) acotada al contexto actual.
- **Tareas**:
  - **Server actions** para `personal_tareas`, `personal_eventos`, `personal_notas`: listar, crear, editar, eliminar; usar `createClient()` de Supabase y respetar RLS.
  - **Páginas**:
    - `/dashboard/personal/tareas`: listado + formulario/dialog para crear/editar (reutilizar patrones de `src/app/(dashboard)/dashboard/planificacion/` si aplica).
    - `/dashboard/personal/calendario`: vista de eventos personales (reutilizar lógica/vista de `src/app/(dashboard)/dashboard/calendario/` adaptada a `personal_eventos`).
    - `/dashboard/personal/notas`: listado + crear/editar notas.
  - **Configuración por contexto**:
    - **Modelo de datos (decidido)**: una sola tabla `app_config` con columna `contexto` ('lisual' | 'personal'), clave-valor por contexto: `(id, contexto, key, value, updated_at)`, UNIQUE(contexto, key). Lisual y personal comparten el mismo esquema; RLS restringe por contexto (lisual = solo admin; personal = solo miembros del user_manager default). Ver sección "Modelo app_config" más abajo.
    - Lisual: ya existe `src/app/(dashboard)/dashboard/configuracion/page.tsx`; mantener.
    - Cristian Alancay: `/dashboard/personal/configuracion` con formulario y guardado en `app_config` (contexto = 'personal').
  - **Búsqueda global (⌘K)** (`src/components/dashboard/global-search.tsx` + `src/lib/actions/search.ts`):
    - Pasar contexto actual (lisual vs personal) al abrir el command (ej. desde pathname o desde un React context).
    - En `searchGlobal`: añadir parámetro `contexto`; si `contexto === "personal"`, buscar solo en `personal_tareas`, `personal_eventos`, `personal_notas` y devolver tipos/links acordes; si `contexto === "lisual"`, mantener comportamiento actual (leads, clientes, presupuestos, proyectos).
- **Archivos**: nuevas páginas y acciones bajo `dashboard/personal/`, `src/lib/actions/search.ts`, `src/components/dashboard/global-search.tsx`, y posible nueva migración para tabla(s) de configuración por contexto.

---

### Fase 4 – Ajustes opcionales

- **Objetivo**: UX (persistir último contexto) y, si aplica, reforzar seguridad.
- **Tareas**:
  - **Persistir último contexto**: guardar en `localStorage` (clave `dashboard_context`: `"lisual"` | `"personal"`) al elegir Lisual o Cristian Alancay en el sidebar; al cargar la app en `/dashboard`, si el valor guardado es `"personal"`, redirigir a `/dashboard/personal`. Implementado en `src/lib/contexto-storage.ts`, sidebar (onClick en los links) y `DashboardContextRedirect` en el layout.
  - **Middleware y user_manager_members (decisión)**: no se añade chequeo en middleware. El acceso a datos personales ya está protegido por RLS (solo miembros del user_manager pueden leer/escribir en `personal_*` y `app_config` con contexto personal). Un usuario no miembro que acceda a `/dashboard/personal` vería páginas vacías y no podría guardar nada. Si en el futuro se quiere impedir incluso el acceso a la ruta, se puede añadir en middleware una verificación contra `user_manager_members` (requeriría llamada a Supabase o a una API) y redirigir a `/dashboard` si no es miembro.
  - **Futuro**: recordatorios/notificaciones para tareas o eventos personales (solo mencionar en el plan, sin implementar en esta fase).
- **Archivos**: `src/lib/contexto-storage.ts`, `src/components/dashboard/app-sidebar.tsx`, `src/components/dashboard/dashboard-context-redirect.tsx`, `src/app/(dashboard)/layout.tsx`.

Implementar en ese orden reduce riesgo: primero datos y permisos, luego UI del selector, después la funcionalidad de Cristian Alancay y por último pulido.

---

## Decisiones tomadas

1. **Chat**: En **ambos** contextos. El ítem Chat aparece en el menú de Lisual y en el de Cristian Alancay; mismo chat (mismas sesiones) accesible desde cualquiera de los dos.
2. **Configuración**: **Cada contexto tiene sus propias configuraciones.** Lisual: configuración de Lisual (integraciones, parámetros laborales) en `/dashboard/configuracion`. Cristian Alancay: configuración de Cristian (ajustes personales) en `/dashboard/personal/configuracion`. Almacenar config por contexto (tabla con contexto 'lisual' | 'personal' o tablas separadas).
3. **Búsqueda global (⌘K)**: **Cada uno enfocado a su área.** En Lisual: busca solo en datos Lisual (leads, clientes, presupuestos, proyectos, etc.). En Cristian Alancay: busca solo en datos personales (tareas, eventos, notas).
4. **Rol de Eliana**: **admin** con acceso completo (lectura, escritura, consultas, configuración en ambos contextos).

---

## Modelo app_config (configuración por contexto)

- **Tabla única** `app_config`: `id` (uuid), `contexto` ('lisual' | 'personal'), `key` (text), `value` (text, nullable), `updated_at` (timestamptz). UNIQUE(contexto, key).
- **RLS**: contexto 'lisual' → solo usuarios con `profiles.role = 'admin'` pueden leer/escribir; contexto 'personal' → solo usuarios en `user_manager_members` del user_manager con slug 'default' pueden leer/escribir.
- **Uso**: Lisual usa la misma tabla con contexto 'lisual' (futuro); Cristian Alancay usa contexto 'personal'. Formulario en `/dashboard/personal/configuracion` guarda en `app_config` con contexto 'personal'.
