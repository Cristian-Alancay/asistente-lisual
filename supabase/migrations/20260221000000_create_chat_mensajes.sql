-- Chat mensajes: historial de conversaciones con el asistente IA
CREATE TABLE IF NOT EXISTS public.chat_mensajes (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_mensajes_usuario_created
  ON public.chat_mensajes(usuario_id, created_at);

ALTER TABLE public.chat_mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own chat_mensajes" ON public.chat_mensajes;
CREATE POLICY "Users can CRUD own chat_mensajes"
  ON public.chat_mensajes FOR ALL
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
