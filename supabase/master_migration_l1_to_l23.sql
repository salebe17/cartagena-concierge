-- MASTER MIGRATION: LEVELS 1 to 23 (ZERO TO HERO)
-- Run this entire script in Supabase SQL Editor to catch up with all stress tests.
-- It is designed to be idempotent (safe to run multiple times).

BEGIN;

-- ==========================================
-- 1. CORE AUTH & PROFILES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'admin', 'driver'
    phone TEXT,
    kyc_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    deleted_at TIMESTAMP WITH TIME ZONE, -- Level 18: Soft Delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger to create profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 2. PROPERTIES & BOOKINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Level 18 Safe
    title TEXT NOT NULL,
    address TEXT,
    price_cop BIGINT DEFAULT 0,
    status TEXT DEFAULT 'active',
    ical_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    guest_name TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    platform TEXT DEFAULT 'manual', -- 'airbnb', 'booking'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. SERVICE REQUESTS & LOGS (STAFF)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    requested_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    assigned_staff_id UUID REFERENCES public.profiles(id),
    deleted_at TIMESTAMP WITH TIME ZONE, -- Level 18: Soft Delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.service_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    staff_member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'in_progress',
    start_photos TEXT[],
    end_photos TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. FINANCE (STRIPE & INVOICES)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Level 18: Critical Fix
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'unpaid',
    stripe_invoice_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.stripe_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. CHAT SYSTEM
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id),
    receiver_id UUID REFERENCES public.profiles(id),
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
    content TEXT,
    media_url TEXT,
    media_type TEXT DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. SYSTEM SETTINGS & AUDIT (LEVEL 20)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT,
    record_id UUID,
    operation TEXT,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 7. PERFORMANCE INDEXES (LEVEL 19)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_service_requests_property_id ON public.service_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_invoices_profile_id ON public.invoices(profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(service_request_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_id ON public.audit_logs(table_name, record_id);

-- ==========================================
-- 8. SECURITY & RLS POLICIES (HARDENING)
-- ==========================================
-- (Simplified for brevity, ensuring Admin Access is universal)

-- Profiles
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Full Access Profiles" ON profiles;
CREATE POLICY "Admin Full Access Profiles" ON profiles FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "User Update Own Profile" ON profiles;
CREATE POLICY "User Update Own Profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Service Requests
DROP POLICY IF EXISTS "Admin Full Access Requests" ON service_requests;
CREATE POLICY "Admin Full Access Requests" ON service_requests FOR ALL USING (
   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "User Read Own Requests" ON service_requests;
CREATE POLICY "User Read Own Requests" ON service_requests FOR SELECT USING (
   EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
);

-- Chat Messages
DROP POLICY IF EXISTS "Users read own messages" ON messages;
CREATE POLICY "Users read own messages" ON messages FOR SELECT USING (
   auth.uid() = sender_id OR auth.uid() = receiver_id
);
DROP POLICY IF EXISTS "Users insert own messages" ON messages;
CREATE POLICY "Users insert own messages" ON messages FOR INSERT WITH CHECK (
   auth.uid() = sender_id
);

-- ==========================================
-- 9. STORAGE POLICIES (LEVEL 23)
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-media', 'chat-media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Chat Public Read" ON storage.objects;
CREATE POLICY "Chat Public Read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "Chat Auth Upload" ON storage.objects;
CREATE POLICY "Chat Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "Chat Owner Delete" ON storage.objects;
CREATE POLICY "Chat Owner Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'chat-media' AND auth.uid() = owner);

-- ==========================================
-- 10. AUDIT TRIGGERS (LEVEL 20)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_audit_logging() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (table_name, record_id, operation, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes AFTER UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_audit_logging();

DROP TRIGGER IF EXISTS audit_properties_changes ON public.properties;
CREATE TRIGGER audit_properties_changes AFTER INSERT OR UPDATE OR DELETE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.handle_audit_logging();

-- ==========================================
-- 11. RPC FUNCTIONS (LEVEL 13: STATS)
-- ==========================================
CREATE OR REPLACE FUNCTION get_finance_stats()
RETURNS JSONB AS $$
DECLARE
    total_revenue BIGINT;
    by_service JSONB;
    prop_revenue JSONB;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue FROM invoices WHERE status = 'paid';
    
    SELECT jsonb_object_agg(service_type, sub_total) INTO by_service FROM (
        SELECT sr.service_type, COALESCE(SUM(i.amount), 0) as sub_total 
        FROM invoices i JOIN service_requests sr ON i.service_request_id = sr.id 
        WHERE i.status = 'paid' GROUP BY sr.service_type
    ) t;

    SELECT jsonb_agg(jsonb_build_object('id', p.id, 'title', p.title, 'revenue', COALESCE(SUM(i.amount), 0))) INTO prop_revenue
    FROM properties p LEFT JOIN invoices i ON p.owner_id = i.profile_id AND i.status = 'paid'
    GROUP BY p.id;

    RETURN jsonb_build_object(
        'total', total_revenue,
        'byService', COALESCE(by_service, '{}'::jsonb),
        'propertyRevenue', COALESCE(prop_revenue, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
