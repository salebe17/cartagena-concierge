-- Add missing columns to profiles table if they don't exist
alter table profiles 
add column if not exists phone text,
add column if not exists bio text;
