-- RLS: solo usuarios autenticados
DROP POLICY IF EXISTS "Allow all for anon (temporal - configurar con Auth)" ON leads;
DROP POLICY IF EXISTS "Allow all for anon (temporal - configurar con Auth)" ON presupuestos;
DROP POLICY IF EXISTS "Allow all for anon (temporal - configurar con Auth)" ON seguimientos;
DROP POLICY IF EXISTS "Allow all for anon (temporal - configurar con Auth)" ON clientes;
DROP POLICY IF EXISTS "Allow all for anon (temporal - configurar con Auth)" ON reuniones;

CREATE POLICY "Authenticated full access" ON leads FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON presupuestos FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON seguimientos FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON clientes FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON reuniones FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
