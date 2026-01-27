-- 1. Performance Indices
-- Accelerate dashboard queries that filter by status/date
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_date ON public.service_requests(requested_date);
CREATE INDEX IF NOT EXISTS idx_service_requests_property ON public.service_requests(property_id);

-- Accelerate booking lookups (Calendar Sync / Range Checks)
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(property_id, start_date, end_date);

-- Accelerate RLS checks
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_id);

-- 2. Data Integrity / Constraints (Optional, applied if extensions exist)
-- Ensure start_date < end_date for bookings
ALTER TABLE public.bookings 
ADD CONSTRAINT check_booking_dates CHECK (end_date > start_date);
