-- Add admin to the ENUM if it doesn't already exist
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';

-- Create an RLS policy so Admins can read all profiles (moderation)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING ( auth.jwt() ->> 'role' = 'admin' );

-- Create an RLS policy so Admins can update profiles (suspensions/bans)
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING ( auth.jwt() ->> 'role' = 'admin' );

-- Create an RLS policy so Admins can view all bids
CREATE POLICY "Admins can view all bids"
ON public.bids FOR SELECT
USING ( auth.jwt() ->> 'role' = 'admin' );

-- Create an RLS policy so Admins can view all service requests
CREATE POLICY "Admins can view all service requests"
ON public.service_requests FOR SELECT
USING ( auth.jwt() ->> 'role' = 'admin' );
