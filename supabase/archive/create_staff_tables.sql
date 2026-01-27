-- 1. Create task_templates (The Playbook)
DROP TABLE IF EXISTS task_templates CASCADE;
CREATE TABLE IF NOT EXISTS task_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_type TEXT NOT NULL, -- 'cleaning', 'maintenance'
    zone TEXT NOT NULL,         -- 'Kitchen', 'Living Room'
    task_label TEXT NOT NULL,   -- 'Check fridge'
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- 2. Create service_logs (The Execution)
DROP TABLE IF EXISTS service_logs CASCADE;
CREATE TABLE IF NOT EXISTS service_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    staff_name TEXT, -- Capturado al inicio "Soy Maria"
    notes TEXT,
    start_photos TEXT[], -- Array of URLs
    end_photos TEXT[],   -- Array of URLs
    completed_tasks JSONB DEFAULT '[]'::jsonb, -- Array of task IDs
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed'
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE service_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for task_templates (Read: Everyone, Write: Only Admin)
DROP POLICY IF EXISTS "Everyone can read task templates" ON task_templates;
CREATE POLICY "Everyone can read task templates" ON task_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage task templates" ON task_templates;
CREATE POLICY "Admins can manage task templates" ON task_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. RLS Policies for service_logs (Admin + Driver access)
-- Drivers need to insert/update logs for requests they are handling.
-- Ideally, we'd limit this to assigned drivers, but for now: 'driver' role or 'admin' role.

DROP POLICY IF EXISTS "Staff can insert logs" ON service_logs;
CREATE POLICY "Staff can insert logs" ON service_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('driver', 'admin'))
);

DROP POLICY IF EXISTS "Staff can view logs" ON service_logs;
CREATE POLICY "Staff can view logs" ON service_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('driver', 'admin'))
);

DROP POLICY IF EXISTS "Staff can update own logs" ON service_logs;
CREATE POLICY "Staff can update own logs" ON service_logs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('driver', 'admin'))
);

-- 5. Seed some initial tasks if empty
INSERT INTO task_templates (service_type, zone, task_label, is_required)
SELECT 'cleaning', 'Cocina', 'Verificar nevera (Items olvidados)', true
WHERE NOT EXISTS (SELECT 1 FROM task_templates WHERE task_label = 'Verificar nevera (Items olvidados)');

INSERT INTO task_templates (service_type, zone, task_label, is_required)
SELECT 'cleaning', 'Baños', 'Limpiar espejos y grifería', true
WHERE NOT EXISTS (SELECT 1 FROM task_templates WHERE task_label = 'Limpiar espejos y grifería');

INSERT INTO task_templates (service_type, zone, task_label, is_required)
SELECT 'cleaning', 'Habitaciones', 'Cambiar sábanas y toallas', true
WHERE NOT EXISTS (SELECT 1 FROM task_templates WHERE task_label = 'Cambiar sábanas y toallas');
