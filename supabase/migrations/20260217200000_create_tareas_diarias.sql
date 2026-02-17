-- Tareas diarias personalizadas (planificación)
CREATE TABLE IF NOT EXISTS tareas (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT false,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  prioridad TEXT DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tareas_usuario_fecha ON tareas(usuario_id, fecha);
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own tareas" ON tareas;
CREATE POLICY "Users can CRUD own tareas"
  ON tareas FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
