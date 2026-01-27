-- FIX: Update check_requests_type constraint to allow ALL supported service types
-- Includes: keys, plumbing, electricity, gas, insurance, refrigeration, laundry, houseware, linens

BEGIN;

ALTER TABLE public.service_requests
DROP CONSTRAINT IF EXISTS check_requests_type;

ALTER TABLE public.service_requests
ADD CONSTRAINT check_requests_type
CHECK (service_type IN (
    'cleaning', 
    'maintenance', 
    'concierge', 
    'interior_finishes', 
    'transport',
    'keys',
    'plumbing',
    'electricity',
    'gas',
    'insurance',
    'refrigeration',
    'laundry',
    'houseware',
    'linens'
));

COMMIT;
