-- =============================================================================
-- Auditoría: optimización RLS (auth.uid() -> (select auth.uid())) e índices
-- Referencia: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- =============================================================================

-- 1. Índices para foreign keys sin cobertura
CREATE INDEX IF NOT EXISTS idx_leads_referred_by_lead_id ON public.leads(referred_by_lead_id);
CREATE INDEX IF NOT EXISTS idx_seguimientos_presupuesto_id ON public.seguimientos(presupuesto_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_video_camara_id ON public.solicitudes_video(camara_id);

-- 2. Actualizar función is_member_of_user_manager para performance
CREATE OR REPLACE FUNCTION public.is_member_of_user_manager(p_user_manager_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_manager_members m
    WHERE m.user_manager_id = p_user_manager_id AND m.user_id = (SELECT auth.uid())
  );
$$;

-- 3. RLS profiles: corregir "Admins can update any profile" (WITH CHECK true -> explícito)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin')
  );

-- 4. RLS profiles: Users can view/update own (auth.uid optimizado)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK (((SELECT auth.uid()) = id) AND (role = (SELECT p.role FROM public.profiles p WHERE p.id = (SELECT auth.uid()))));

-- 5. RLS leads, presupuestos, seguimientos, clientes, reuniones
DROP POLICY IF EXISTS "Authenticated full access" ON public.leads;
CREATE POLICY "Authenticated full access" ON public.leads FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated full access" ON public.presupuestos;
CREATE POLICY "Authenticated full access" ON public.presupuestos FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated full access" ON public.seguimientos;
CREATE POLICY "Authenticated full access" ON public.seguimientos FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated full access" ON public.clientes;
CREATE POLICY "Authenticated full access" ON public.clientes FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated full access" ON public.reuniones;
CREATE POLICY "Authenticated full access" ON public.reuniones FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- 6. RLS proyectos, activos, instalaciones
DROP POLICY IF EXISTS "Authenticated full access" ON public.proyectos;
CREATE POLICY "Authenticated full access" ON public.proyectos FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated full access" ON public.activos;
CREATE POLICY "Authenticated full access" ON public.activos FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated full access" ON public.instalaciones;
CREATE POLICY "Authenticated full access" ON public.instalaciones FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- 7. RLS experiencia
DROP POLICY IF EXISTS "Authenticated full access" ON public.solicitudes_video;
CREATE POLICY "Authenticated full access" ON public.solicitudes_video FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated full access" ON public.revisiones;
CREATE POLICY "Authenticated full access" ON public.revisiones FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated full access" ON public.referencias;
CREATE POLICY "Authenticated full access" ON public.referencias FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- 8. RLS tareas
DROP POLICY IF EXISTS "Users can CRUD own tareas" ON public.tareas;
CREATE POLICY "Users can CRUD own tareas" ON public.tareas FOR ALL
  USING ((SELECT auth.uid()) = usuario_id) WITH CHECK ((SELECT auth.uid()) = usuario_id);

-- 9. RLS chat_sessions
DROP POLICY IF EXISTS "usuarios ven sus sesiones" ON public.chat_sessions;
CREATE POLICY "usuarios ven sus sesiones" ON public.chat_sessions FOR SELECT
  USING ((SELECT auth.uid()) = usuario_id);

DROP POLICY IF EXISTS "usuarios crean sesiones" ON public.chat_sessions;
CREATE POLICY "usuarios crean sesiones" ON public.chat_sessions FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = usuario_id);

DROP POLICY IF EXISTS "usuarios actualizan sus sesiones" ON public.chat_sessions;
CREATE POLICY "usuarios actualizan sus sesiones" ON public.chat_sessions FOR UPDATE
  USING ((SELECT auth.uid()) = usuario_id);

DROP POLICY IF EXISTS "usuarios eliminan sus sesiones" ON public.chat_sessions;
CREATE POLICY "usuarios eliminan sus sesiones" ON public.chat_sessions FOR DELETE
  USING ((SELECT auth.uid()) = usuario_id);

-- 10. RLS chat_mensajes
DROP POLICY IF EXISTS "Users can CRUD own chat_mensajes" ON public.chat_mensajes;
CREATE POLICY "Users can CRUD own chat_mensajes" ON public.chat_mensajes FOR ALL
  USING ((SELECT auth.uid()) = usuario_id) WITH CHECK ((SELECT auth.uid()) = usuario_id);
