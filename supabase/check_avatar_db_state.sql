select 
  id, 
  email, 
  raw_user_meta_data->>'avatar_url' as metadata_avatar,
  (select avatar_url from public.profiles where id = auth.users.id) as profile_avatar,
  last_sign_in_at
from auth.users
order by last_sign_in_at desc
limit 1;
