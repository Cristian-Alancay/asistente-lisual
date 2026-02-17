-- =============================================================================
-- Cargar datos de perfil en Supabase (Cristian Alancay y Eliana Corraro)
-- =============================================================================
-- 1. Creá primero los usuarios en Supabase: Authentication → Users → Add user
--    (o que cada uno tenga ya su cuenta con su correo de login).
-- 2. Reemplazá los placeholders con los correos REALES con los que inician sesión.
-- 3. Ejecutá este script en el SQL Editor de Supabase (Dashboard → SQL Editor).
-- =============================================================================

-- Usuario 1: Cristian Alancay
-- Reemplazá 'correo.cristian@ejemplo.com' por el correo con el que Cristian hace login.
UPDATE public.profiles
SET
  full_name = 'Cristian Alancay',
  additional_emails = ARRAY['correo2.cristian@ejemplo.com']::text[],  -- más correos si querés
  phone_1 = '+54 9 11 1234-5678',   -- reemplazá con el teléfono real
  phone_2 = NULL,                    -- segundo teléfono o NULL
  role = 'admin',
  updated_at = NOW()
WHERE email = 'correo.cristian@ejemplo.com';

-- Usuario 2: Eliana Corraro
-- Reemplazá 'correo.eliana@ejemplo.com' por el correo con el que Eliana hace login.
UPDATE public.profiles
SET
  full_name = 'Eliana Corraro',
  additional_emails = ARRAY['otro.correo@ejemplo.com']::text[],
  phone_1 = '+54 9 11 8765-4321',
  phone_2 = NULL,
  role = 'admin',
  updated_at = NOW()
WHERE email = 'correo.eliana@ejemplo.com';

-- Verificar (opcional): listar perfiles con sus datos
-- SELECT id, email, full_name, role, additional_emails, phone_1, phone_2, updated_at
-- FROM public.profiles;
