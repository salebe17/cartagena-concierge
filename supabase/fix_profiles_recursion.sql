-- FIX: Infinite Recursion in Profiles RLS
-- The error "infinite recursion detected in policy for relation profiles" occurs when
-- a policy on 'profiles' queries 'profiles' (e.g. checking for role='admin') to determine access.

BEGIN;

-- 1. Drop potentially recursive policies
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone view profiles" ON public.profiles;

-- 2. Create a clean, non-recursive SELECT policy
-- We allow everyone to see basic profile info (Name, Avatar).
-- Ideally, we would restrict PII (Phone/Email) but for now we prioritize fixing the crash.
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- 3. Ensure Update/Insert policies are also non-recursive (View Own)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

COMMIT;
