-- LEVEL 20: The Black Box (Audit Logging)

-- 1. Create Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    changed_by UUID DEFAULT auth.uid(), -- Automatically captures who did it
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS (Admins Read-Only, No Writes allowed even by Admin to preserve integrity)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- System can insert, but no one can update/delete
-- We don't need an INSERT policy if we use SECURITY DEFINER function

-- 3. Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION public.handle_audit_logging()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        changed_by
    )
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        to_jsonb(OLD),
        to_jsonb(NEW),
        auth.uid()
    );
    RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply Triggers to Critical Tables
-- Profiles (Role changes, banning)
DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes
AFTER UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_logging();

-- Properties (Price changes, malicious edits)
DROP TRIGGER IF EXISTS audit_properties_changes ON public.properties;
CREATE TRIGGER audit_properties_changes
AFTER INSERT OR UPDATE OR DELETE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_logging();

-- System Settings (Maintenance mode toggle)
DROP TRIGGER IF EXISTS audit_settings_changes ON public.system_settings;
CREATE TRIGGER audit_settings_changes
AFTER INSERT OR UPDATE OR DELETE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_logging();
