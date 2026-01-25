-- =========================================================
-- FORCE FIX PERMISSIONS (Admin "God Mode")
-- Ejecuta esto en Supabase -> SQL Editor para arreglar la desaparición de datos
-- =========================================================

-- 1. Asegurar que las tablas tengan RLS habilitado (por seguridad)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- service_logs might not exist in some schemas, create if missing or alter
CREATE TABLE IF NOT EXISTS service_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    staff_name TEXT,
    notes TEXT,
    start_photos TEXT[],
    end_photos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE service_logs ENABLE ROW LEVEL SECURITY;


-- 2. Limpiar políticas antiguas (Evita conflictos)
DROP POLICY IF EXISTS "Admin Full Access Properties" ON properties;
DROP POLICY IF EXISTS "Admin Full Access Requests" ON service_requests;
DROP POLICY IF EXISTS "Admin Full Access Bookings" ON bookings;
DROP POLICY IF EXISTS "Admin Full Access Logs" ON service_logs;

DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;

DROP POLICY IF EXISTS "Users can manage requests for own properties" ON service_requests;

-- 3. Crear el "Admin God Mode" (Ver TODO si eres admin)
-- Explicación: Si tu rol es 'admin' en la tabla 'profiles', puedes hacer SELECT/INSERT/UPDATE/DELETE de todo.

-- PROPERTIES
CREATE POLICY "Admin Full Access Properties" ON properties
    FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- SERVICE REQUESTS
CREATE POLICY "Admin Full Access Requests" ON service_requests
    FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- BOOKINGS
CREATE POLICY "Admin Full Access Bookings" ON bookings
    FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- SERVICE LOGS
CREATE POLICY "Admin Full Access Logs" ON service_logs
    FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Restaurar acceso normal para Propietarios (solo lo suyo)
-- Re-creamos políticas básicas para que el dashboard normal no se rompa

-- Propiedades: Dueño ve lo suyo
CREATE POLICY "Owner Access Properties" ON properties
    FOR ALL
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Solicitudes: Dueño ve solo de sus propiedades
CREATE POLICY "Owner Access Requests" ON service_requests
    FOR ALL
    USING (property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid()));

-- Reservas: Dueño ve solo de sus propiedades
CREATE POLICY "Owner Access Bookings" ON bookings
    FOR ALL
    USING (property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid()));
