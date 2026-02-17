# Seguridad - Asistente Lisual

## Auditoría Supabase (feb 2025)

### ERROR: Security Definer View
- **Vista**: `public.v_instalaciones_pendientes`
- **Problema**: La vista usa SECURITY DEFINER, ejecutando con permisos del creador en vez del usuario.
- **Remediación**: [Documentación Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)

### WARN: Function Search Path Mutable
- **Función**: `public.handle_new_user`
- **Problema**: El `search_path` de la función no está fijado.
- **Remediación**: [Documentación Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)

### WARN: RLS Policy Always True
- **Tabla**: `profiles`, política "Admins can update any profile"
- **Problema**: WITH CHECK siempre es true en UPDATE.
- **Nota**: Puede ser intencional para que admins actualicen cualquier perfil. Revisar si se requiere restringir más.

### WARN: Leaked Password Protection Disabled
- **Problema**: La protección contra contraseñas filtradas (HaveIBeenPwned) está deshabilitada.
- **Remediación**: Habilitar en Supabase Dashboard → Auth → Password Security
