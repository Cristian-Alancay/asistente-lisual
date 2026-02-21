-- Link de reunión y moneda del presupuesto estimado (Cristian Lisual)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS link_reunion TEXT,
  ADD COLUMN IF NOT EXISTS presupuesto_estimado_moneda TEXT DEFAULT 'ARS' CHECK (presupuesto_estimado_moneda IN ('USD', 'ARS'));

COMMENT ON COLUMN public.leads.link_reunion IS 'URL de la reunión (Meet, Zoom, etc.)';
COMMENT ON COLUMN public.leads.presupuesto_estimado_moneda IS 'Moneda del presupuesto estimado: USD o ARS';
