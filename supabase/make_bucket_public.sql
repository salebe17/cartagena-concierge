-- FORCE PUBLIC BUCKET
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "Make avatars public" on storage.objects;
create policy "Make avatars public"
  on storage.objects for select
  using ( bucket_id = 'avatars' );
