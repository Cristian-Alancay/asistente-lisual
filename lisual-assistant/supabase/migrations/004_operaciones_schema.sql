-- Fase 2: Operaciones
-- proyectos, activos, instalaciones

-- Proyectos (por cliente)
CREATE TABLE proyectos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  direccion TEXT,
  contacto_sitio TEXT,
  telefono_sitio TEXT,
  fecha_instalacion_programada DATE,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'programada', 'en_proceso', 'completada', 'atrasada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activos (equipos: cámara, chip, teleport)
CREATE TABLE activos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('camara', 'chip', 'teleport')),
  codigo TEXT NOT NULL,
  numero_serie TEXT,
  iccid TEXT,
  numero_telefono TEXT,
  estado TEXT NOT NULL DEFAULT 'en_stock' CHECK (estado IN ('en_stock', 'asignado', 'instalado', 'en_distribucion')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Instalaciones (ejecución por proyecto)
CREATE TABLE instalaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  tecnico_asignado TEXT,
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  checklist_completado BOOLEAN DEFAULT FALSE,
  fotos_urls JSONB DEFAULT '[]',
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vista: instalaciones pendientes (proyectos sin instalación o atrasados)
CREATE OR REPLACE VIEW v_instalaciones_pendientes AS
SELECT
  p.id AS proyecto_id,
  p.nombre AS proyecto_nombre,
  p.fecha_instalacion_programada,
  p.estado AS proyecto_estado,
  c.id AS cliente_id,
  l.nombre AS cliente_nombre,
  l.empresa AS cliente_empresa,
  (SELECT COUNT(*) FROM activos a WHERE a.proyecto_id = p.id AND a.estado = 'en_distribucion') AS equipos_en_distribucion
FROM proyectos p
JOIN clientes c ON c.id = p.cliente_id
JOIN leads l ON l.id = c.lead_id
WHERE p.estado IN ('pendiente', 'programada', 'atrasada', 'en_proceso')
  AND NOT EXISTS (
    SELECT 1 FROM instalaciones i
    WHERE i.proyecto_id = p.id AND i.fecha_fin IS NOT NULL
  );

-- Índices
CREATE INDEX idx_proyectos_cliente ON proyectos(cliente_id);
CREATE INDEX idx_proyectos_estado ON proyectos(estado);
CREATE INDEX idx_proyectos_fecha ON proyectos(fecha_instalacion_programada);
CREATE INDEX idx_activos_proyecto ON activos(proyecto_id);
CREATE INDEX idx_activos_estado ON activos(estado);
CREATE INDEX idx_activos_tipo ON activos(tipo);
CREATE INDEX idx_instalaciones_proyecto ON instalaciones(proyecto_id);

-- RLS
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE instalaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON proyectos FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON activos FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON instalaciones FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
