-- Múltiples correos y 1-2 teléfonos por usuario (Cristian Alancay, Eliana Corraro)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS additional_emails TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS phone_1 TEXT,
  ADD COLUMN IF NOT EXISTS phone_2 TEXT;

COMMENT ON COLUMN public.profiles.additional_emails IS 'Correos adicionales del usuario (el principal está en email)';
COMMENT ON COLUMN public.profiles.phone_1 IS 'Teléfono principal';
COMMENT ON COLUMN public.profiles.phone_2 IS 'Segundo teléfono (opcional)';
