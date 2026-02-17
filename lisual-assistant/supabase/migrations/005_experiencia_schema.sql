-- Fase 3: Experiencia al Cliente

CREATE TABLE solicitudes_video (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_hora_video TIMESTAMPTZ NOT NULL,
  camara_id UUID REFERENCES activos(id) ON DELETE SET NULL,
  motivo TEXT,
  duracion_min INTEGER,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'entregado')),
  link_descarga TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE revisiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('semana1', 'mes1', 'trimestral', 'semestral')),
  programada_para DATE NOT NULL,
  realizada_at TIMESTAMPTZ,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE referencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_referidor_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  lead_referido_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  incentivo_ofrecido TEXT,
  incentivo_activado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_solicitudes_video_cliente ON solicitudes_video(cliente_id);
CREATE INDEX idx_solicitudes_video_estado ON solicitudes_video(estado);
CREATE INDEX idx_revisiones_cliente ON revisiones(cliente_id);
CREATE INDEX idx_revisiones_programada ON revisiones(programada_para);
CREATE INDEX idx_referencias_cliente ON referencias(cliente_referidor_id);
CREATE INDEX idx_referencias_lead ON referencias(lead_referido_id);

ALTER TABLE solicitudes_video ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE referencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON solicitudes_video FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON revisiones FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON referencias FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
