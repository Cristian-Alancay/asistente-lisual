-- =============================================================================
-- Fase 1: Cargar user_manager_members (Cristian y Eliana) y rol admin
-- =============================================================================
-- 1. Ejecutá primero la migración 20260218000000_user_manager_personal.sql
-- 2. Los usuarios Cristian y Eliana deben existir en auth.users (y en profiles)
-- 3. Reemplazá los correos por los REALES con los que inician sesión.
-- 4. Ejecutá este script en el SQL Editor de Supabase (Dashboard → SQL Editor).
-- =============================================================================

-- Asegurar rol admin y agregar como miembros del user_manager "default"
-- Cuando Eliana tenga cuenta en Auth, agregá su correo al IN (...).
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email IN ('alancayc953@gmail.com');

-- Insertar como miembros del user_manager "default" (contexto Cristian Alancay)
INSERT INTO public.user_manager_members (user_manager_id, user_id, rol)
SELECT um.id, p.id, 'admin'
FROM public.user_manager um
CROSS JOIN public.profiles p
WHERE um.slug = 'default'
  AND p.email IN ('alancayc953@gmail.com')
ON CONFLICT (user_manager_id, user_id) DO NOTHING;

-- Verificar (opcional):
-- SELECT um.nombre, um.slug, p.email, p.full_name, m.rol
-- FROM public.user_manager_members m
-- JOIN public.user_manager um ON um.id = m.user_manager_id
-- JOIN public.profiles p ON p.id = m.user_id;
