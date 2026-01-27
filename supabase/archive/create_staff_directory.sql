-- Create staff_members table
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cleaner', -- 'cleaner', 'maintenance', 'supervisor'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    rating FLOAT DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admins can manage staff_members" ON staff_members;
CREATE POLICY "Admins can manage staff_members" ON staff_members 
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Staff can view staff_members" ON staff_members;
CREATE POLICY "Staff can view staff_members" ON staff_members 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'driver'))
);

-- Seed some initial data
INSERT INTO staff_members (full_name, role) VALUES 
('María Pérez', 'cleaner'),
('Jose Rodriguez', 'maintenance')
ON CONFLICT DO NOTHING;
