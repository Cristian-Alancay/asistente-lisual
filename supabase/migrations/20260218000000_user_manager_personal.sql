-- =============================================================================
-- Fase 1: User Manager + contexto personal (Lisual vs Cristian Alancay)
-- Tablas: user_manager, user_manager_members, personal_tareas, personal_eventos, personal_notas
-- RLS: acceso a personal_* solo si auth.uid() está en user_manager_members
-- Seed: 1 user_manager; user_manager_members se cargan con script (por email)
-- =============================================================================

-- Asegurar que profiles tenga columna role (por si no existe en otro migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN role TEXT NOT NULL DEFAULT 'usuario'
        CHECK (role IN ('admin', 'usuario', 'viewer'));
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- user_manager: un "tenant" (por ahora uno solo: Cristian Alancay)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_manager (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_manager IS 'Contextos/tenants: Lisual (laboral) o Cristian Alancay (personal). Por ahora uno solo.';

-- -----------------------------------------------------------------------------
-- user_manager_members: usuarios que pertenecen a un user_manager
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_manager_members (
  user_manager_id UUID NOT NULL REFERENCES public.user_manager(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol TEXT NOT NULL DEFAULT 'member' CHECK (rol IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_manager_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_manager_members_user_id
  ON public.user_manager_members(user_id);

COMMENT ON TABLE public.user_manager_members IS 'Usuarios con acceso a un user_manager (Cristian y Eliana para el contexto personal).';

-- -----------------------------------------------------------------------------
-- personal_tareas: tareas del contexto Cristian Alancay (compartidas entre miembros)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_tareas (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_manager_id UUID NOT NULL REFERENCES public.user_manager(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT false,
  prioridad TEXT DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta')),
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_tareas_user_manager_fecha
  ON public.personal_tareas(user_manager_id, fecha);

-- -----------------------------------------------------------------------------
-- personal_eventos: eventos del calendario personal (Cristian Alancay)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_eventos (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_manager_id UUID NOT NULL REFERENCES public.user_manager(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_eventos_user_manager_fechas
  ON public.personal_eventos(user_manager_id, fecha_inicio, fecha_fin);

-- -----------------------------------------------------------------------------
-- personal_notas: notas del contexto Cristian Alancay
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_notas (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_manager_id UUID NOT NULL REFERENCES public.user_manager(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  contenido TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_notas_user_manager
  ON public.personal_notas(user_manager_id);

-- -----------------------------------------------------------------------------
-- RLS: user_manager y user_manager_members
-- user_manager: solo autenticados pueden leer (para saber si pertenecen)
-- user_manager_members: solo autenticados pueden leer (para RLS de personal_*)
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_manager ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_manager_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read user_manager" ON public.user_manager;
CREATE POLICY "Authenticated can read user_manager"
  ON public.user_manager FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated can read user_manager_members" ON public.user_manager_members;
CREATE POLICY "Authenticated can read user_manager_members"
  ON public.user_manager_members FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- RLS: personal_tareas, personal_eventos, personal_notas
-- Solo si auth.uid() está en user_manager_members para ese user_manager_id
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_member_of_user_manager(p_user_manager_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_manager_members m
    WHERE m.user_manager_id = p_user_manager_id AND m.user_id = auth.uid()
  );
$$;

ALTER TABLE public.personal_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_notas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can CRUD personal_tareas" ON public.personal_tareas;
CREATE POLICY "Members can CRUD personal_tareas"
  ON public.personal_tareas FOR ALL
  TO authenticated
  USING (public.is_member_of_user_manager(user_manager_id))
  WITH CHECK (public.is_member_of_user_manager(user_manager_id));

DROP POLICY IF EXISTS "Members can CRUD personal_eventos" ON public.personal_eventos;
CREATE POLICY "Members can CRUD personal_eventos"
  ON public.personal_eventos FOR ALL
  TO authenticated
  USING (public.is_member_of_user_manager(user_manager_id))
  WITH CHECK (public.is_member_of_user_manager(user_manager_id));

DROP POLICY IF EXISTS "Members can CRUD personal_notas" ON public.personal_notas;
CREATE POLICY "Members can CRUD personal_notas"
  ON public.personal_notas FOR ALL
  TO authenticated
  USING (public.is_member_of_user_manager(user_manager_id))
  WITH CHECK (public.is_member_of_user_manager(user_manager_id));

-- -----------------------------------------------------------------------------
-- Seed: 1 user_manager (contexto Cristian Alancay / personal)
-- user_manager_members se inserta con script por email (ver seed-user-manager-members.sql)
-- -----------------------------------------------------------------------------
INSERT INTO public.user_manager (nombre, slug)
VALUES ('Cristian Alancay', 'default')
ON CONFLICT (slug) DO NOTHING;
