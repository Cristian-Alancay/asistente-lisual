-- =============================================================================
-- Habilitar protección contra contraseñas filtradas (HaveIBeenPwned)
--
-- Esta migración NO se puede aplicar por SQL directamente.
-- Es necesario activarla desde el Dashboard de Supabase:
--
--   1. Ir a: Authentication → Providers → Email
--   2. Activar: "Protect against leaked passwords"
--   3. Opcionalmente, habilitar: "Minimum password length" (recomendado: 8+)
--
-- Referencia: https://supabase.com/docs/guides/auth/passwords#leaked-password-protection
--
-- Al activar, Supabase verificará automáticamente contra la API de HaveIBeenPwned
-- (usando k-anonymity, sin enviar la contraseña completa) en cada sign-up y
-- password change. Si la contraseña aparece en brechas conocidas, se rechaza.
-- =============================================================================

-- Placeholder para que Supabase CLI reconozca esta migración como ejecutada
SELECT 1;
