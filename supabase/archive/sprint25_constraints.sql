-- LEVEL 25: The "Banana" Proofing (Strict Check Constraints)
-- Prevents invalid data states that break frontend logic.

BEGIN;

-- 1. Profiles: Role Validation
-- Prevent creating a user with role 'super_god_emperor'
ALTER TABLE public.profiles
ADD CONSTRAINT check_profiles_role
CHECK (role IN ('user', 'admin', 'driver'));

-- 2. Service Requests: Status Validation
-- Prevent status 'banana'
ALTER TABLE public.service_requests
ADD CONSTRAINT check_requests_status
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));

-- 3. Service Requests: Service Type Validation
ALTER TABLE public.service_requests
ADD CONSTRAINT check_requests_type
CHECK (service_type IN ('cleaning', 'maintenance', 'concierge'));

-- 4. Invoices: Status Validation
ALTER TABLE public.invoices
ADD CONSTRAINT check_invoices_status
CHECK (status IN ('unpaid', 'paid', 'void', 'refunded'));

-- 5. Service Logs: Status Validation
ALTER TABLE public.service_logs
ADD CONSTRAINT check_logs_status
CHECK (status IN ('in_progress', 'completed', 'verified'));

COMMIT;
