# Verificación del backend (Supabase) vía MCP

**Fecha:** 17 de febrero de 2025  
**Proyecto:** Assistant Cristian Alancay  
**API URL:** https://ymoatplfykkcibuaplhd.supabase.co

---

## 1. Estado general: **OK – Backend operativo**

El backend en Supabase está creado, las tablas existen, RLS está activo en todas y hay políticas de acceso definidas. La API responde y las consultas SQL vía MCP funcionan correctamente.

---

## 2. Tablas y esquema

| Tabla              | RLS | Filas (aprox) | Políticas |
|--------------------|-----|---------------|-----------|
| `leads`            | Sí  | 0             | Authenticated full access |
| `presupuestos`     | Sí  | 0             | Authenticated full access |
| `clientes`         | Sí  | 0             | Authenticated full access |
| `proyectos`        | Sí  | 0             | Authenticated full access |
| `activos`          | Sí  | 0             | Authenticated full access |
| `instalaciones`    | Sí  | 0             | Authenticated full access |
| `reuniones`        | Sí  | 0             | Authenticated full access |
| `seguimientos`     | Sí  | 0             | Authenticated full access |
| `referencias`      | Sí  | 0             | Authenticated full access |
| `revisiones`       | Sí  | 0             | Authenticated full access |
| `solicitudes_video`| Sí  | 0             | Authenticated full access |
| `profiles`         | Sí  | 1             | Ver/editar propio; admins pueden editar cualquier perfil |
| `tareas`           | Sí  | 0             | Users can CRUD own tareas |
| `chat_sessions`    | Sí  | 0             | CRUD por usuario (ver/crear/actualizar/eliminar propias) |
| `chat_mensajes`    | Sí  | 0             | Users can CRUD own chat_mensajes |

**Total:** 15 tablas en `public`, todas con RLS habilitado.

---

## 3. Accesos y permisos (RLS)

- **Tablas de negocio** (leads, clientes, presupuestos, proyectos, etc.): solo usuarios **autenticados** (`auth.uid() IS NOT NULL`) tienen acceso completo (SELECT, INSERT, UPDATE, DELETE). Anónimos no tienen acceso.
- **profiles**: cada usuario ve y puede actualizar solo su propio perfil; los usuarios con `role = 'admin'` pueden actualizar cualquier perfil.
- **tareas**: cada usuario solo puede CRUD sus propias tareas (`usuario_id = auth.uid()`).
- **chat_sessions** y **chat_mensajes**: cada usuario solo puede ver/crear/actualizar/eliminar sus propias sesiones y mensajes.

**Conclusión:** Accesos y permisos están creados y son coherentes con un modelo “usuario autenticado” y “datos por usuario” donde aplica.

---

## 4. Migraciones aplicadas

- `001_initial_schema`
- `002_auth_profiles`
- `003_rls_auth`
- `004_operaciones_schema`
- `005_experiencia_schema`
- `006_profiles_role_and_permissions`
- `007_profiles_rls_fix_self_role`
- `add_whatsapp_canal`
- `create_tareas_diarias`
- `create_chat_mensajes`
- `chat_sessions`

Todas las migraciones listadas aparecen aplicadas en el proyecto.

---

## 5. Auth y perfiles

- **profiles:** 1 registro (usuario con email y `role: usuario`).
- **Claves:** anon key (legacy) y publishable key disponibles y no deshabilitadas.
- Extensiones relevantes (uuid-ossp, pgcrypto, pg_graphql, supabase_vault) están instaladas.

---

## 6. Recomendaciones del advisor (seguridad)

### Corregido (17 feb 2025)

- **Vista SECURITY DEFINER:** `v_instalaciones_pendientes` recreada con `security_invoker = on`. Migración: `20260217215625_fix_v_instalaciones_pendientes_security_invoker.sql`
- **Search path en función:** `handle_new_user` actualizada con `SET search_path = public`. Migración: `20260217215629_fix_handle_new_user_search_path.sql`

### Pendiente (opcional)

| Nivel  | Tema | Detalle | Acción sugerida |
|--------|------|---------|------------------|
| WARN   | Política RLS muy permisiva | En `profiles`, “Admins can update any profile” usa `WITH CHECK (true)` | Ajustar WITH CHECK para limitar qué campos/valores puede escribir un admin. [Docs](https://supabase.com/docs/guides/database/database-linter?lint=0024_permissive_rls_policy) |
| WARN   | Contraseñas comprometidas | Protección contra contraseñas filtradas (HaveIBeenPwned) deshabilitada en Auth | Activar en Dashboard: Authentication → Settings. [Docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) |

---

## 7. Rendimiento (opcional)

- En las políticas RLS se recomienda usar `(select auth.uid())` en lugar de `auth.uid()` para evitar re-evaluación por fila.
- Algunas foreign keys no tienen índice (leads.referred_by_lead_id, seguimientos.presupuesto_id, solicitudes_video.camara_id); añadir índices si esas columnas se usan en filtros o JOINs.
- Hay índices marcados como “no usados”; pueden ser útiles cuando crezca el uso; valorar eliminarlos solo si se confirma que no se usarán.

---

## 8. Uso de MCP

La verificación se hizo con MCP de Supabase:

- `list_tables` – listado de tablas y RLS.
- `list_migrations` – migraciones aplicadas.
- `execute_sql` – políticas RLS y datos de `profiles`.
- `get_advisors` (security y performance) – recomendaciones anteriores.
- `get_project_url` y `get_publishable_keys` – confirmación de API y claves.

**Conclusión:** El backend está creado, los accesos y permisos están configurados y MCP funciona correctamente. Se corrigieron el ERROR de la vista SECURITY DEFINER y el WARN de `handle_new_user` (search_path). Opcional: endurecer la política de admins en `profiles` y activar la protección de contraseñas en Auth.
