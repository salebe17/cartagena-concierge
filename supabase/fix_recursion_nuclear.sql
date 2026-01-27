-- FIX: NUCLEAR OPTION for Profiles Recursion
-- This script proactively finds AND drops ALL policies on public.profiles
-- regardless of their name, ensuring no hidden recursive logic remains.

BEGIN;

-- 1. Dynamic Drop of ALL Policies on 'profiles'
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    ) 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname); 
    END LOOP; 
END $$;

-- 2. Re-Apply SAFE Policies (No Recursion)

-- A. Public Read (Essential for Chat/Bookings)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- B. User Self-Management (Insert/Update Own)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. Safety Check: Service Requests (Ensure they use is_admin function if possible, or fallback to safe check)
-- Re-applying the secure functions just in case.
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

COMMIT;
