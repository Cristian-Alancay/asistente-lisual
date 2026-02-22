-- Datos de contrato para renovaciones y tracking
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS cantidad_camaras integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS tipo_licencia text,
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS duracion_meses integer DEFAULT 12,
  ADD COLUMN IF NOT EXISTS fecha_vencimiento date,
  ADD COLUMN IF NOT EXISTS notas_conversion text;
