-- FIX: Permission Denied for table "users" (auth.users)
-- RLS policies cannot query auth.users directly due to security restrictions.
-- We must retrieve the user's email from public.profiles instead.

BEGIN;

-- 1. Drop the problematic Staff Policy on service_requests
DROP POLICY IF EXISTS "Staff view assigned requests" ON public.service_requests;

-- 2. Recreate it using public.profiles for email lookup
CREATE POLICY "Staff view assigned requests" 
ON public.service_requests 
FOR SELECT 
USING (
  assigned_staff_id IN (
    SELECT id 
    FROM public.staff_members 
    WHERE email = (
      SELECT email 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
  OR
  is_admin()
  OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Note: This assumes public.profiles has the 'email' column populated (which the triggers handle).
-- If public.profiles.email is empty, staff won't see their tasks.

COMMIT;
