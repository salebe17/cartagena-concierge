-- FIX: PERMISSIONS FINAL (Consolidated Nuclear Clean-up)
-- This script proactively drops ALL policies on 'service_requests', 'messages', and 'staff_members'
-- to ensure NO policy remains that might query 'auth.users' directly.

BEGIN;

-- 1. Helper: Function to secure Admin Check (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- 2. Clean-up Service Requests (Drop ALL policies dynamically)
DO $$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'service_requests' AND schemaname = 'public') 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.service_requests', r.policyname); 
    END LOOP; 
END $$;

-- 3. Clean-up Messages (Drop ALL policies dynamically)
DO $$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages' AND schemaname = 'public') 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', r.policyname); 
    END LOOP; 
END $$;

-- 4. Clean-up Staff Members (Drop ALL policies dynamically)
DO $$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'staff_members' AND schemaname = 'public') 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.staff_members', r.policyname); 
    END LOOP; 
END $$;


-- ================= RECREATE POLICIES (SECURE) =================

-- A. SERVICE REQUESTS
-- Guests View Own
CREATE POLICY "Guests view own requests" 
ON public.service_requests FOR SELECT 
USING (requester_id = auth.uid());

CREATE POLICY "Guests create requests" 
ON public.service_requests FOR INSERT 
WITH CHECK (requester_id = auth.uid());

-- Admins View All (Using Security Definer Function)
CREATE POLICY "Admins view all requests" 
ON public.service_requests FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins update all requests" 
ON public.service_requests FOR UPDATE 
USING (is_admin());

-- Staff View Assigned (Using PUBLIC PROFILES lookup, NOT auth.users)
CREATE POLICY "Staff view assigned requests" 
ON public.service_requests FOR SELECT 
USING (
  assigned_staff_id IN (
    SELECT id FROM public.staff_members 
    WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
  OR is_admin()
);

-- B. MESSAGES
-- Users View Involced (Using Safe Checks)
CREATE POLICY "Users view messages they are part of" 
ON public.messages FOR SELECT 
USING (
    sender_id = auth.uid() 
    OR receiver_id = auth.uid() 
    OR is_admin()
);

CREATE POLICY "Users send messages" 
ON public.messages FOR INSERT 
WITH CHECK (sender_id = auth.uid());


-- C. STAFF MEMBERS (Visibility Fix)
-- Admin View All
CREATE POLICY "Admins view all staff" 
ON public.staff_members FOR SELECT 
USING (is_admin());

-- Staff/Users View Self (Via Profiles)
CREATE POLICY "Staff see own record" 
ON public.staff_members FOR SELECT 
USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- Public Directory (Safe for Clients to see Driver Name/Photo)
CREATE POLICY "Public staff directory" 
ON public.staff_members FOR SELECT 
USING (true);


COMMIT;
