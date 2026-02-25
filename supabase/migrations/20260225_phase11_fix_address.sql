-- Migration to fix missing address column for the Bidding Pivot
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS address TEXT;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
