-- Extend reuniones table with Fathom meeting data
ALTER TABLE reuniones
  ADD COLUMN IF NOT EXISTS fathom_recording_id bigint UNIQUE,
  ADD COLUMN IF NOT EXISTS titulo text,
  ADD COLUMN IF NOT EXISTS titulo_calendario text,
  ADD COLUMN IF NOT EXISTS resumen_md text,
  ADD COLUMN IF NOT EXISTS transcripcion jsonb,
  ADD COLUMN IF NOT EXISTS action_items jsonb,
  ADD COLUMN IF NOT EXISTS fathom_url text,
  ADD COLUMN IF NOT EXISTS share_url text,
  ADD COLUMN IF NOT EXISTS fecha_reunion timestamptz,
  ADD COLUMN IF NOT EXISTS fecha_fin timestamptz,
  ADD COLUMN IF NOT EXISTS idioma text DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS raw jsonb;

-- Backfill fecha_reunion from the original fecha_hora if not set
UPDATE reuniones SET fecha_reunion = fecha_hora WHERE fecha_reunion IS NULL AND fecha_hora IS NOT NULL;

-- Allow lead_id to be nullable (Fathom creates leads on the fly)
ALTER TABLE reuniones ALTER COLUMN lead_id DROP NOT NULL;

-- Index for fecha_reunion (the original idx_reuniones_fecha uses fecha_hora)
CREATE INDEX IF NOT EXISTS idx_reuniones_fecha_reunion ON reuniones(fecha_reunion DESC);

-- Participantes: N attendees per meeting, each optionally linked to a lead
CREATE TABLE IF NOT EXISTS reunion_participantes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reunion_id uuid NOT NULL REFERENCES reuniones(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  nombre text,
  email text,
  es_externo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reunion_id, email)
);

CREATE INDEX IF NOT EXISTS idx_reunion_part_reunion ON reunion_participantes(reunion_id);
CREATE INDEX IF NOT EXISTS idx_reunion_part_lead ON reunion_participantes(lead_id);

ALTER TABLE reunion_participantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage reunion_participantes"
  ON reunion_participantes FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
