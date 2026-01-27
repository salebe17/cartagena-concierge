-- FIX: Infinite Recursion via Security Definer Function
-- This breaks the RLS loop by allowing role checks to bypass RLS entirely.

BEGIN;

-- 1. Create a secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Bypass RLS
SET search_path = public -- Secure search path
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- 2. Update Service Requests Policies to use is_admin()
DROP POLICY IF EXISTS "Admins view all requests" ON public.service_requests;
CREATE POLICY "Admins view all requests" ON public.service_requests FOR SELECT USING (
  is_admin()
);

DROP POLICY IF EXISTS "Admins update all requests" ON public.service_requests;
CREATE POLICY "Admins update all requests" ON public.service_requests FOR UPDATE USING (
  is_admin()
);

DROP POLICY IF EXISTS "Staff view assigned requests" ON public.service_requests;
CREATE POLICY "Staff view assigned requests" ON public.service_requests FOR SELECT USING (
  assigned_staff_id IN (SELECT id FROM public.staff_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR
  is_admin()
  OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'staff') -- We can optimize this one too later if needed
);

-- 3. Update Messages Policies
DROP POLICY IF EXISTS "Users view messages they are part of" ON public.messages;
CREATE POLICY "Users view messages they are part of" ON public.messages FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid() OR is_admin()
);

COMMIT;
