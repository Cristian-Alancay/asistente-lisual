-- Corregir advisor: vista con SECURITY DEFINER puede saltarse RLS.
-- Recrear la vista con security_invoker = on para que respete RLS del usuario que consulta.
DROP VIEW IF EXISTS public.v_instalaciones_pendientes;

CREATE VIEW public.v_instalaciones_pendientes
WITH (security_invoker = on) AS
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
