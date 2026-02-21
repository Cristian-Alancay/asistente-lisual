# Permisos y restricciones del sistema (Assistant Cristian Alancay)

## Usuarios con acceso

Solo **dos usuarios** tienen acceso completo al sistema:

- **Cristian Alancay**
- **Eliana Corraro**

Cada uno puede tener **uno o más correos** y **uno o dos números de teléfono** (ver perfil más abajo).

**Acceso denegado**: cualquier persona que no sea uno de estos dos usuarios, desde cualquier canal (web, API, etc.), recibe **acceso denegado** y no puede usar el sistema.

## Registro

- **No hay registro público.** El alta de usuarios está eliminada: no existe flujo de “Registrarse”.
- La ruta `/register` redirige siempre a `/login`.
- Los únicos usuarios que pueden existir son los creados manualmente en Supabase (o por un admin en el futuro) y deben estar en la allowlist.

### Deshabilitar registro en Supabase (recomendado)

Para que nadie pueda darse de alta ni siquiera por API:

1. Entrá al **Dashboard de Supabase** → **Authentication** → **Providers** → **Email**.
2. Desactivá **“Enable Sign Up”** (o equivalente según la versión).
3. Guardá los cambios. A partir de ahí solo se pueden crear usuarios desde el panel (Add user) o por invitación si lo tenés configurado.

## Allowlist por correo

Para que solo los dos usuarios autorizados puedan entrar, se usa una **lista de correos permitidos** en entorno:

```bash
# .env.local - correos autorizados (separados por coma). Solo estos pueden acceder.
ALLOWED_USER_EMAILS=correo.cristian@ejemplo.com,correo.eliana@ejemplo.com
```

- Si `ALLOWED_USER_EMAILS` está definida, **solo** los usuarios cuyo **email de login** esté en esa lista pueden acceder al dashboard.
- Si alguien inicia sesión con un correo que no está en la lista, se cierra su sesión y se redirige a `/login?error=denied` (“Acceso denegado”).
- Si no defines `ALLOWED_USER_EMAILS`, no se aplica filtro por correo (útil en desarrollo).

## Perfil: varios correos y 1–2 teléfonos

En la tabla `profiles` de Supabase cada usuario tiene:

- **email**: correo principal (el de login).
- **additional_emails**: array de correos adicionales (para consultas, notificaciones, etc.).
- **phone_1**: teléfono principal.
- **phone_2**: segundo teléfono (opcional).

### Dónde cargar los datos en Supabase

1. **Desde la app (recomendado)**  
   Entrá a **Dashboard → Configuración**. Ahí está el formulario **“Datos de perfil (Supabase)”**: nombre completo, correos adicionales (separados por coma) y teléfonos 1 y 2. Al guardar, se actualiza la tabla `profiles` en Supabase.

2. **Con SQL (datos iniciales)**  
   Ejecutá el script `supabase/scripts/seed-perfiles-usuarios.sql` en el **SQL Editor** de Supabase. Reemplazá los placeholders por los correos y teléfonos reales de Cristian y Eliana; el script hace `UPDATE profiles` para cada usuario.

## Rol viewer (solo lectura)

Los usuarios con rol **viewer** pueden ver el dashboard pero no crear, editar ni eliminar datos:

- En la UI no se muestran botones "Nuevo Lead", "Nuevo presupuesto", "Nuevo Proyecto", "Nuevo equipo", ni los menús Editar/Eliminar en tablas.
- Las Server Actions de escritura (createLead, updateLead, deleteLead, createPresupuesto, etc.) comprueban el rol y devuelven error "Sin permiso. Solo lectura." si el usuario es viewer.

## Rutas protegidas

- **Login obligatorio**: `/dashboard/*` y `/` requieren sesión; si no hay usuario → redirección a `/login`.
- **Solo admin**: `/dashboard/configuracion` solo es accesible si `profiles.role = 'admin'`.
- **Auth**: Si ya hay sesión, `/login` y `/register` redirigen a `/dashboard`.
- **OAuth**: Tras login con Google (u otro provider), Supabase redirige a `/auth/callback`; ahí se intercambia el code por sesión y se redirige a `/dashboard`.

## Autenticación (canales)

Según el diseño del sistema, la autenticación puede integrar:

- **Google** (login con cuenta Google).
- **WhatsApp API** (verificación/contacto por teléfono).
- **Correo** (consultas / notificaciones).

La allowlist y el “solo 2 usuarios” se aplican al **acceso al sistema** (quién puede entrar al dashboard). Los canales anteriores son complementos a ese acceso.

## Cómo configurar los 2 usuarios

1. **Crear las cuentas en Supabase** (Dashboard → Authentication → Users), o que cada uno se registre una sola vez si en algún momento tuviste registro y ya no.
2. **Asignar rol admin** (opcional, para que puedan ver Configuración):

   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email IN ('correo.cristian@...', 'correo.eliana@...');
   ```

3. **Definir la allowlist** en `.env.local`:

   ```bash
   ALLOWED_USER_EMAILS=correo.cristian@ejemplo.com,correo.eliana@ejemplo.com
   ```

4. **Aplicar la migración** de perfiles (correos y teléfonos):

   ```bash
   npx supabase db push
   ```
   o ejecutar manualmente el SQL de `supabase/migrations/20260217190000_008_profiles_emails_phones.sql`.

## Uso en código

- **Server**: `requireAuth()`, `requireRole('admin')`, `getProfile()` (incluye `role`, `additional_emails`, `phone_1`, `phone_2`).
- **Middleware**: allowlist, redirección de `/register` y rutas solo admin en `src/lib/supabase/middleware.ts`.
- **Cerrar sesión si no autorizado**: ruta `GET /api/auth/deny` cierra sesión y redirige a `/login?error=denied`.

## Próximos pasos (continuar)

- [ ] Deshabilitar **Enable Sign Up** en Supabase (Authentication → Providers → Email).
- [ ] Definir **ALLOWED_USER_EMAILS** en `.env.local` con los correos reales de Cristian y Eliana.
- [ ] Ejecutar **migración 008** (`npx supabase db push`) si aún no está aplicada.
- [ ] Cargar datos de perfil: desde **Configuración** en la app o con `supabase/scripts/seed-perfiles-usuarios.sql`.
- [ ] Opcional: integraciones en Configuración (Google, WhatsApp, Email) cuando se implementen.
