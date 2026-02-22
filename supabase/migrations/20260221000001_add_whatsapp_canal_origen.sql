-- Agregar 'whatsapp' al CHECK constraint de canal_origen en leads
-- El webhook de WhatsApp y el agente IA crean leads con canal_origen = 'whatsapp'
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_canal_origen_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_canal_origen_check
  CHECK (canal_origen IN ('reunion', 'manual', 'web', 'referencia', 'whatsapp'));
