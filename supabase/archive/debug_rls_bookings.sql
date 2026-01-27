-- Check active policies for 'bookings' table
select * from pg_policies wheretablename = 'bookings';

-- Check if RLS is enabled on the table
select relname, relrowsecurity 
from pg_class 
where relname = 'bookings';
