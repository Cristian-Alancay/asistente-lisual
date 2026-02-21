-- =============================================================================
-- Configuración por contexto (lisual | personal): tabla única app_config
-- RLS: lisual = solo admin; personal = solo miembros user_manager default
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_config (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  contexto TEXT NOT NULL CHECK (contexto IN ('lisual', 'personal')),
  key TEXT NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (contexto, key)
);

COMMENT ON TABLE public.app_config IS 'Configuración por contexto: lisual (laboral) o personal (Cristian Alancay). Clave-valor por contexto.';

CREATE INDEX IF NOT EXISTS idx_app_config_contexto_key
  ON public.app_config(contexto, key);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Política: lisual = solo admin; personal = solo miembros del user_manager default
CREATE OR REPLACE FUNCTION public.app_config_allow(contexto_val TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN contexto_val = 'lisual' THEN
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    WHEN contexto_val = 'personal' THEN
      public.is_member_of_user_manager((SELECT id FROM public.user_manager WHERE slug = 'default' LIMIT 1))
    ELSE false
  END;
$$;

DROP POLICY IF EXISTS "app_config_select" ON public.app_config;
CREATE POLICY "app_config_select"
  ON public.app_config FOR SELECT
  TO authenticated
  USING (public.app_config_allow(contexto));

DROP POLICY IF EXISTS "app_config_insert" ON public.app_config;
CREATE POLICY "app_config_insert"
  ON public.app_config FOR INSERT
  TO authenticated
  WITH CHECK (public.app_config_allow(contexto));

DROP POLICY IF EXISTS "app_config_update" ON public.app_config;
CREATE POLICY "app_config_update"
  ON public.app_config FOR UPDATE
  TO authenticated
  USING (public.app_config_allow(contexto))
  WITH CHECK (public.app_config_allow(contexto));

DROP POLICY IF EXISTS "app_config_delete" ON public.app_config;
CREATE POLICY "app_config_delete"
  ON public.app_config FOR DELETE
  TO authenticated
  USING (public.app_config_allow(contexto));
