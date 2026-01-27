-- LEVEL 10: Maintenance Mode Infrastructure

-- 1. System Settings Table
-- Key-Value store for global configs
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. Insert Default Maintenance Mode (OFF)
INSERT INTO public.system_settings (key, value)
VALUES ('maintenance_mode', '{"enabled": false, "message": "Estamos realizando mejoras. Volvemos pronto."}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. RLS: Only Admins can UPDATE, Everyone can READ
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read system settings" ON public.system_settings;
CREATE POLICY "Public can read system settings" ON public.system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
CREATE POLICY "Admins can update system settings" ON public.system_settings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Audit this too!
DROP TRIGGER IF EXISTS audit_settings ON public.system_settings;
CREATE TRIGGER audit_settings
AFTER UPDATE ON public.system_settings
FOR EACH ROW EXECUTE PROCEDURE public.log_audit_event();
