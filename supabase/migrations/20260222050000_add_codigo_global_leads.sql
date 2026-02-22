-- Global sequential code for leads (persists through CX conversion)
-- Format: NMS-0001, NMS-0002, ...

ALTER TABLE leads ADD COLUMN IF NOT EXISTS codigo text UNIQUE;

-- Sequence for auto-increment
CREATE SEQUENCE IF NOT EXISTS leads_codigo_seq START 1;

-- Backfill existing leads that don't have a code
DO $$
DECLARE
  r RECORD;
  seq_val int;
BEGIN
  FOR r IN SELECT id FROM leads WHERE codigo IS NULL ORDER BY created_at ASC
  LOOP
    seq_val := nextval('leads_codigo_seq');
    UPDATE leads SET codigo = 'NMS-' || lpad(seq_val::text, 4, '0') WHERE id = r.id;
  END LOOP;
END$$;

-- Make it NOT NULL now that all rows are backfilled
ALTER TABLE leads ALTER COLUMN codigo SET NOT NULL;
ALTER TABLE leads ALTER COLUMN codigo SET DEFAULT '';

-- Trigger function: auto-assign code on INSERT if empty
CREATE OR REPLACE FUNCTION generate_lead_codigo()
RETURNS trigger AS $$
BEGIN
  IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
    NEW.codigo := 'NMS-' || lpad(nextval('leads_codigo_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lead_codigo
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION generate_lead_codigo();

CREATE INDEX IF NOT EXISTS idx_leads_codigo ON leads(codigo);
