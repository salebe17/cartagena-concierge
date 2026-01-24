-- Add ical_url to properties
alter table if exists public.properties 
add column if not exists ical_url text;

-- Add external_id to bookings (for duplicate detection)
alter table if exists public.bookings 
add column if not exists external_id text;

-- Create alerts table
create table if not exists public.alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  title text not null,
  message text,
  status text default 'unread', -- 'unread', 'read'
  type text default 'pending_service', -- 'pending_service', 'sync_error'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for alerts
alter table public.alerts enable row level security;

create policy "Users can view their own alerts"
on public.alerts for select
using ( auth.uid() = user_id );

-- Index for performance
create index if not exists idx_bookings_external_id on public.bookings(external_id);
create index if not exists idx_properties_ical_url on public.properties(ical_url) where ical_url is not null;
