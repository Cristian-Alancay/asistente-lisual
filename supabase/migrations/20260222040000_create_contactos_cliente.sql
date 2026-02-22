-- Contactos múltiples por cliente (post-conversión)
CREATE TABLE IF NOT EXISTS contactos_cliente (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,

  nombre text NOT NULL,
  cargo text,
  area text CHECK (area IS NULL OR area IN (
    'direccion','obra','marketing','administracion','seguridad','compras','legal','otro'
  )),
  email text,
  telefono text,
  es_principal boolean DEFAULT false,
  notas text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_contactos_cliente_cliente ON contactos_cliente(cliente_id);
CREATE INDEX idx_contactos_cliente_principal ON contactos_cliente(cliente_id) WHERE es_principal = true;

ALTER TABLE contactos_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage contactos_cliente"
  ON contactos_cliente FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
