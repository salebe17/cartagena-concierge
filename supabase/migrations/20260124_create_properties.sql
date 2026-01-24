-- Create Properties Table
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) not null,
  title text not null,
  address text,
  property_type text, -- 'Apartment', 'House', 'Villa'
  max_guests int default 2,
  bedrooms int default 1,
  bathrooms int default 1,
  beds int default 1,
  size_sqm int,
  wifi_network text,
  wifi_password text,
  access_instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for Properties
alter table public.properties enable row level security;

create policy "Users can view their own properties"
on public.properties for select
using ( auth.uid() = owner_id );

create policy "Users can insert their own properties"
on public.properties for insert
with check ( auth.uid() = owner_id );

create policy "Users can update their own properties"
on public.properties for update
using ( auth.uid() = owner_id );

create policy "Users can delete their own properties"
on public.properties for delete
using ( auth.uid() = owner_id );


-- Create Bookings Table (for Calendar)
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  guest_name text,
  platform text default 'Airbnb', -- 'Airbnb', 'Booking', 'Direct', 'Blocked'
  status text default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for Bookings
alter table public.bookings enable row level security;

create policy "Users can view bookings of their properties"
on public.bookings for select
using (
  exists (
    select 1 from public.properties
    where properties.id = bookings.property_id
    and properties.owner_id = auth.uid()
  )
);

create policy "Users can insert bookings for their properties"
on public.bookings for insert
with check (
  exists (
    select 1 from public.properties
    where properties.id = bookings.property_id
    and properties.owner_id = auth.uid()
  )
);

create policy "Users can update bookings for their properties"
on public.bookings for update
using (
  exists (
    select 1 from public.properties
    where properties.id = bookings.property_id
    and properties.owner_id = auth.uid()
  )
);
