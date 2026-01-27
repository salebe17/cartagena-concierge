-- CARTAGENA CONCIERGE: PRODUCTION SCHEMA V1 (CONSOLIDATED)
-- This script sets up the entire database structure, RLS, Functions, and Triggers.
-- Run this on a FRESH Supabase instance to replicate the environment.

BEGIN;

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- ==============================================================================
-- 2. ENUMS & CONSTANTS
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'host', 'guest', 'staff', 'driver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_type AS ENUM ('cleaning', 'maintenance', 'concierge', 'transport');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE staff_role AS ENUM ('cleaner', 'maintenance', 'driver', 'concierge', 'supervisor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE staff_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. TABLES (DDL)
-- ==============================================================================

-- 3.1 PROFILES (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role user_role DEFAULT 'guest',
    avatar_url TEXT,
    phone TEXT,
    email TEXT,
    kyc_status TEXT DEFAULT 'pending',
    kyc_id_url TEXT,
    kyc_selfie_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3.2 STAFF MEMBERS (Internal Employees)
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    role staff_role DEFAULT 'cleaner',
    status staff_status DEFAULT 'active',
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    metrics JSONB DEFAULT '{"totalJobs": 0, "avgCompletionTimeMinutes": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3.3 PROPERTIES
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    image_url TEXT,
    details JSONB DEFAULT '{}',
    ical_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3.4 SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id),
    requester_id UUID REFERENCES public.profiles(id),
    assigned_staff_id UUID REFERENCES public.staff_members(id),
    service_type service_type NOT NULL,
    status service_status DEFAULT 'pending',
    description TEXT,
    notes TEXT,
    requested_date TIMESTAMP WITH TIME ZONE,
    evidence_urls TEXT[],
    quoted_price NUMERIC(10, 2),
    currency TEXT DEFAULT 'COP',
    is_paid BOOLEAN DEFAULT FALSE,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete support
);

-- 3.5 MESSAGES (Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_request_id UUID REFERENCES public.service_requests(id),
    sender_id UUID REFERENCES public.profiles(id),
    receiver_id UUID REFERENCES public.profiles(id),
    content TEXT,
    media_url TEXT, -- L24: Rich Media Support
    media_type TEXT CHECK (media_type IN ('text', 'image', 'video', 'file')), 
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3.6 AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. CONSTRAINTS & INDEXES (Data Integrity)
-- ==============================================================================

-- L25-L26: Strict Constraints
ALTER TABLE public.service_requests 
ADD CONSTRAINT check_valid_status CHECK (status::text = ANY (ARRAY['pending'::text, 'confirmed'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]));

CREATE INDEX IF NOT EXISTS idx_requests_property ON public.service_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_requests_staff ON public.service_requests(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_messages_request ON public.messages(service_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- ==============================================================================
-- 5. TRIGGERS (Automation)
-- ==============================================================================

-- L27: Auto-Update timestamps
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime(updated_at);

DROP TRIGGER IF EXISTS handle_updated_at ON public.staff_members;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime(updated_at);

DROP TRIGGER IF EXISTS handle_updated_at ON public.properties;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime(updated_at);

DROP TRIGGER IF EXISTS handle_updated_at ON public.service_requests;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- User Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'guest');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6.2 SERVICE REQUESTS POLICIES
-- Guests: View Own
DROP POLICY IF EXISTS "Guests view own requests" ON public.service_requests;
CREATE POLICY "Guests view own requests" ON public.service_requests FOR SELECT USING (requester_id = auth.uid());

DROP POLICY IF EXISTS "Guests create requests" ON public.service_requests;
CREATE POLICY "Guests create requests" ON public.service_requests FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Admins: View All / Manage All
DROP POLICY IF EXISTS "Admins view all requests" ON public.service_requests;
CREATE POLICY "Admins view all requests" ON public.service_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins update all requests" ON public.service_requests;
CREATE POLICY "Admins update all requests" ON public.service_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Staff: View Assigned
DROP POLICY IF EXISTS "Staff view assigned requests" ON public.service_requests;
CREATE POLICY "Staff view assigned requests" ON public.service_requests FOR SELECT USING (
  assigned_staff_id IN (SELECT id FROM public.staff_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);


-- 6.3 MESSAGES POLICIES
DROP POLICY IF EXISTS "Users view messages they are part of" ON public.messages;
CREATE POLICY "Users view messages they are part of" ON public.messages FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users send messages" ON public.messages;
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (
    sender_id = auth.uid()
);

-- ==============================================================================
-- 7. STORAGE
-- ==============================================================================
-- Note: Storage buckets must be created via API or UI in some Supabase versions, 
-- but we can set policies here.
-- Bucket: 'chat-attachments'

INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Chat Media" ON storage.objects;
CREATE POLICY "Public Access Chat Media" ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Authenticated Upload Chat Media" ON storage.objects;
CREATE POLICY "Authenticated Upload Chat Media" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'chat-attachments' AND auth.role() = 'authenticated'
);

COMMIT;
