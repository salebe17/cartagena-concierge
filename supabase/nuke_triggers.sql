-- DISABLE ALL TRIGGERS THAT MIGHT BLOCK UPDATES

-- 1. Drop the sync trigger we created (handling new user)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. Drop any recursive profile triggers
drop trigger if exists on_profile_updated on public.profiles;
drop function if exists public.handle_profile_updated();

-- 3. Check for other common triggers (blind drop attempt or just safe removal)
-- (We will just rely on the above for now as they are the most likely culprits)

-- 4. Re-grant simple permissions just in case
grant all on public.profiles to postgres, service_role;
grant all on public.profiles to authenticated;
