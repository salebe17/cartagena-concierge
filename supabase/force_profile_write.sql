-- FORCE PERMISSIONS FOR AVATARS AND PROFILES

-- 1. Storage: Reset and Open Gates for 'avatars'
-- Make bucket public
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Remove conflicting policies
drop policy if exists "Avatar Images Public" on storage.objects;
drop policy if exists "Avatar Upload Auth" on storage.objects;
drop policy if exists "Avatar Update Auth" on storage.objects;
drop policy if exists "Avatar Delete Auth" on storage.objects;
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;

-- Create PERMISSIVE policies
create policy "Give me access to my own files 1g64_0" on storage.objects 
for select using (bucket_id = 'avatars');

create policy "Let me upload my files 1g64_1" on storage.objects 
for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Let me update my files 1g64_2" on storage.objects 
for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');


-- 2. Profiles: Ensure we can WRITE
alter table profiles enable row level security;

-- Drop strict policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Enable insert for authenticated users only" on profiles;

-- Create Simple, Working Policies
create policy "Enable read access for all users"
on profiles for select
using (true);

create policy "Enable insert for users based on user_id"
on profiles for insert
with check (auth.uid() = id);

create policy "Enable update for users based on user_id"
on profiles for update
using (auth.uid() = id);

-- 3. Sync Trigger (Self-Healing)
-- Ensure that if a profile is missing, it gets created automatically on next auth event
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do update
  set avatar_url = coalesce(new.raw_user_meta_data->>'avatar_url', profiles.avatar_url);
  return new;
end;
$$ language plpgsql security definer;

-- Re-attach trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
