-- =========================================================
-- FIX MISSING COLUMNS (Service Logs Schema Update)
-- El error "ended_at does not exist" confirma que la tabla existe
-- pero le faltan columnas nuevas.
-- =========================================================

-- 1. Agregar columnas faltantes a service_logs
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS staff_name TEXT;
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS start_photos TEXT[];
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS end_photos TEXT[];

-- 2. Asegurar que service_request_id exista (por si acaso)
-- Solo corre esto si sospechas que la relación está rota, pero el error actual es sobre 'ended_at'
-- ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE;

-- 3. Verificar permisos nuevamente (solo para estar seguros)
ALTER TABLE service_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Full Access Logs" ON service_logs;
CREATE POLICY "Admin Full Access Logs" ON service_logs
    FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Permitir a Staff (Driver) ver/crear logs (si no existe la regla)
DROP POLICY IF EXISTS "Staff Manage Logs" ON service_logs;
CREATE POLICY "Staff Manage Logs" ON service_logs
    FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'driver'));
