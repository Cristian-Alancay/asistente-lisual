-- Reemplazar contexto 'lisual' por 'trabajo' en app_config (renombrar Lisual → Trabajo en el sistema)

UPDATE public.app_config SET contexto = 'trabajo' WHERE contexto = 'lisual';

ALTER TABLE public.app_config DROP CONSTRAINT IF EXISTS app_config_contexto_check;
ALTER TABLE public.app_config ADD CONSTRAINT app_config_contexto_check
  CHECK (contexto IN ('trabajo', 'personal'));

CREATE OR REPLACE FUNCTION public.app_config_allow(contexto_val TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN contexto_val = 'trabajo' THEN
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    WHEN contexto_val = 'personal' THEN
      public.is_member_of_user_manager((SELECT id FROM public.user_manager WHERE slug = 'default' LIMIT 1))
    ELSE false
  END;
$$;

COMMENT ON TABLE public.app_config IS 'Configuración por contexto: trabajo (laboral) o personal (Cristian Alancay). Clave-valor por contexto.';
