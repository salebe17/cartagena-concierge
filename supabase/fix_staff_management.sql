-- FIX: Allow Admins to Manage (Insert/Update/Delete) Staff Members
-- Currently only SELECT is allowed, blocking the creation of new staff.

BEGIN;

DROP POLICY IF EXISTS "Admins manage staff" ON public.staff_members;

CREATE POLICY "Admins manage staff"
ON public.staff_members
FOR ALL
TO authenticated
USING ( public.is_admin() );

COMMIT;
