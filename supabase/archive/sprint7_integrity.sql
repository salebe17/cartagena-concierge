-- LEVEL 7: Data Integrity Fortification

-- 1. Enable btree_gist for scalar exclusion constraints (if not available, we fall back to manual locking)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Prevent Booking Overlaps (The "Hotelier's Nightmare" Fix)
-- This constraint ensures that for a given property, no two bookings have overlapping time ranges.
-- The && operator checks for overlap.
-- We cast dates to daterange. [) means inclusive start, exclusive end (standard for bookings).
ALTER TABLE public.bookings
ADD CONSTRAINT no_booking_overlap
EXCLUDE USING gist (
    property_id WITH =,
    daterange(start_date, end_date, '[)') WITH &&
);

-- 3. Prevent Invalid Status Transitions for Service Requests
-- A request cannot go from 'completed' back to 'pending' (accidental reopen by bad logic).
-- Define function
CREATE OR REPLACE FUNCTION check_request_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent reopening
    IF OLD.status = 'completed' AND NEW.status = 'pending' THEN
        RAISE EXCEPTION 'Cannot reopen a completed request directly. Create a new one.';
    END IF;
    
    -- Prevent paying a cancelled request (Redundant vs API check, but good for DB safety)
    IF OLD.status = 'cancelled' AND NEW.status = 'paid' THEN
        RAISE EXCEPTION 'Cannot pay a cancelled request.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach Trigger
DROP TRIGGER IF EXISTS validate_status_change ON public.service_requests;
CREATE TRIGGER validate_status_change
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE PROCEDURE check_request_status_transition();
