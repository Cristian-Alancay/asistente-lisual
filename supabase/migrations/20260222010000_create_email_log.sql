-- Email log table for auditing all emails sent via Resend
CREATE TABLE IF NOT EXISTS email_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL CHECK (tipo IN ('presupuesto', 'seguimiento', 'notificacion', 'general')),
  destinatario text NOT NULL,
  asunto text NOT NULL,
  presupuesto_id uuid REFERENCES presupuestos(id) ON DELETE SET NULL,
  seguimiento_id uuid REFERENCES seguimientos(id) ON DELETE SET NULL,
  estado text NOT NULL DEFAULT 'enviado' CHECK (estado IN ('enviado', 'error', 'rebotado')),
  resend_id text,
  error_detail text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_email_log_presupuesto ON email_log(presupuesto_id) WHERE presupuesto_id IS NOT NULL;
CREATE INDEX idx_email_log_seguimiento ON email_log(seguimiento_id) WHERE seguimiento_id IS NOT NULL;
CREATE INDEX idx_email_log_created ON email_log(created_at DESC);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read email_log"
  ON email_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert email_log"
  ON email_log FOR INSERT
  TO authenticated
  WITH CHECK (true);
