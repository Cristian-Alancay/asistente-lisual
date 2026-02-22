-- Add dollar exchange rate tracking columns to leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS cotizacion_dolar_valor numeric,
  ADD COLUMN IF NOT EXISTS cotizacion_dolar_fecha date;

-- Also add instagram and linkedin to canal_origen CHECK constraint if it exists
-- First drop the old constraint, then re-add with new values
DO $$
BEGIN
  ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_canal_origen_check;
  ALTER TABLE public.leads ADD CONSTRAINT leads_canal_origen_check
    CHECK (canal_origen IN ('reunion', 'manual', 'web', 'referencia', 'whatsapp', 'instagram', 'linkedin'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
