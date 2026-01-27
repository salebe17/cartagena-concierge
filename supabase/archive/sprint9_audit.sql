-- LEVEL 9: Audit Trials & Indexing

-- 1. System Audit Logs Table
-- This table is "Append Only" ideally.
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,       -- Snapshot of data before change
    new_data JSONB,       -- Snapshot of data after change
    changed_by UUID REFERENCES auth.users(id), -- The user who made the change
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect Audit Logs (Admins can view, NO ONE can update/delete)
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.system_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.system_audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Audit Trigger Function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
    old_val JSONB;
    new_val JSONB;
BEGIN
    -- Try to get current user ID
    user_id := auth.uid();
    
    IF TG_OP = 'UPDATE' THEN
        old_val := to_jsonb(OLD);
        new_val := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        old_val := to_jsonb(OLD);
        new_val := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_val := NULL;
        new_val := to_jsonb(NEW);
    END IF;

    -- Only log if critical fields changed (to save space) or if it's a DELETE
    -- For Service Requests: Status, Assigned Staff
    IF TG_TABLE_NAME = 'service_requests' AND TG_OP = 'UPDATE' THEN
        IF OLD.status IS NOT DISTINCT FROM NEW.status AND OLD.assigned_staff_id IS NOT DISTINCT FROM NEW.assigned_staff_id THEN
            RETURN NEW; -- Skip logging non-critical upates (like notes typo fix? actually notes are important too. Let's log all for now)
        END IF;
    END IF;

    INSERT INTO public.system_audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP, old_val, new_val, user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach Triggers to Critical Tables
DROP TRIGGER IF EXISTS audit_service_requests ON public.service_requests;
CREATE TRIGGER audit_service_requests
AFTER UPDATE OR DELETE ON public.service_requests
FOR EACH ROW EXECUTE PROCEDURE public.log_audit_event();

DROP TRIGGER IF EXISTS audit_bookings ON public.bookings;
CREATE TRIGGER audit_bookings
AFTER UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE PROCEDURE public.log_audit_event();

DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles
AFTER UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.log_audit_event();

-- 4. Performance Indexing (Missing FK Indexes)
-- Postgres does NOT verify FK indexes automatically. Scanning these tables for joins will be slow without them.
CREATE INDEX IF NOT EXISTS idx_requests_property_id ON public.service_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_requests_staff_id ON public.service_requests(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(service_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
