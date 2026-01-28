-- 1. Create buckets table entry if missing
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- 2. Drop existing policies to avoid conflicts
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Auth Upload" on storage.objects;
drop policy if exists "Auth Update" on storage.objects;
drop policy if exists "Public Access to Avatars" on storage.objects;
drop policy if exists "Users can upload own avatar" on storage.objects;
drop policy if exists "Users can update own avatar" on storage.objects;

-- 3. Create Storage Policies
create policy "Public Access to Avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' );

-- 4. Enable RLS on profiles
alter table profiles enable row level security;

-- 5. Drop existing profile policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Public profiles" on profiles;

-- 6. Create Profile Policies
create policy "Public profiles"
  on profiles for select
  using ( true );

create policy "Users can insert own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- 7. Grant permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
