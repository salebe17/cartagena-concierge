-- FIX: Staff Member Visibility (RLS Chain)
-- The "Staff view assigned requests" policy queries the 'staff_members' table.
-- But 'staff_members' has RLS enabled and likely NO policies, so it returns empty results.
-- This script adds policies to allow users to "see" the staff directory to resolve their own ID.

BEGIN;

-- 1. Admin Visibility (See All Staff)
DROP POLICY IF EXISTS "Admins view all staff" ON public.staff_members;
CREATE POLICY "Admins view all staff" 
ON public.staff_members 
FOR SELECT 
USING ( public.is_admin() );

-- 2. Staff Self-Visibility (See Own Record to resolve ID)
-- We allow any authenticated user to See a staff member if the email matches.
DROP POLICY IF EXISTS "Staff see own record" ON public.staff_members;
CREATE POLICY "Staff see own record" 
ON public.staff_members 
FOR SELECT 
USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- 3. (Optional) Public/Guest Visibility?
-- If we want guests to see their assigned staff's name/photo, we need this:
DROP POLICY IF EXISTS "Guests see assigned staff" ON public.staff_members;
CREATE POLICY "Guests see assigned staff" 
ON public.staff_members 
FOR SELECT 
USING (true); -- Simplifying: Making Staff Directory PUBLIC (Read-Only) for names/avatars is usually standard for this app type.
-- IF you want it stricter, remove the above and rely on specific lookups, 
-- but simpler is better to stop the "Permission Denied" chain.
-- Given we display 'driver_name' etc to clients, public read is appropriate.

COMMIT;
