-- Biblioteca comercial: casos de éxito para ventas B2B
CREATE TABLE IF NOT EXISTS casos_exito (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Información general
  nombre_proyecto text NOT NULL,
  empresa text NOT NULL,
  pais text NOT NULL DEFAULT 'Argentina',
  ciudad text,
  tipo_proyecto text NOT NULL DEFAULT 'edificio_residencial'
    CHECK (tipo_proyecto IN (
      'vivienda_unifamiliar','edificio_residencial','barrio_privado',
      'parque_industrial','nave_industrial','obra_publica',
      'centro_comercial','reforma','loteo','urbanizacion','otro'
    )),
  tamano_obra text,
  duracion_estimada text,

  -- Clasificación comercial
  perfil_cliente text NOT NULL DEFAULT 'pyme'
    CHECK (perfil_cliente IN ('constructora_grande','pyme','desarrolladora','arquitecto','otro')),
  etapa_cliente text DEFAULT 'decision'
    CHECK (etapa_cliente IN ('awareness','consideracion','decision')),
  nivel_presupuesto text DEFAULT 'medio'
    CHECK (nivel_presupuesto IN ('bajo','medio','alto')),

  -- Multi-select fields (stored as JSONB arrays of strings)
  problemas jsonb DEFAULT '[]'::jsonb,
  soluciones jsonb DEFAULT '[]'::jsonb,
  resultados jsonb DEFAULT '[]'::jsonb,

  -- Métricas cuantitativas
  metricas jsonb DEFAULT '{}'::jsonb,

  -- Links de contenido
  link_instagram text,
  link_reel text,
  link_post text,
  link_drive text,
  link_timelapse text,
  imagen_url text,

  -- Uso comercial / ventas
  objecion_responde text,
  frase_gancho text,
  mensaje_whatsapp text,
  script_reunion text,
  momento_ideal text,

  destacado boolean DEFAULT false,
  activo boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_casos_exito_pais ON casos_exito(pais);
CREATE INDEX idx_casos_exito_tipo ON casos_exito(tipo_proyecto);
CREATE INDEX idx_casos_exito_perfil ON casos_exito(perfil_cliente);
CREATE INDEX idx_casos_exito_destacado ON casos_exito(destacado) WHERE destacado = true;

ALTER TABLE casos_exito ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read casos_exito"
  ON casos_exito FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert casos_exito"
  ON casos_exito FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update casos_exito"
  ON casos_exito FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete casos_exito"
  ON casos_exito FOR DELETE TO authenticated USING (true);
