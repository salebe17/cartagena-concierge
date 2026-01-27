-- LEVEL 12: Concurrency & Data Integrity

-- 1. Fix Race Condition in Calendar Sync
-- Prevent duplicate bookings for the same external event on the same property.
-- Using "external_id" which comes from iCal UID.

ALTER TABLE public.bookings
ADD CONSTRAINT unique_booking_external_id UNIQUE (property_id, external_id);

-- Note: If duplicates already exist, this command will fail.
-- In a real migration, we would deduplicate first:
-- DELETE FROM bookings a USING bookings b
-- WHERE a.id < b.id AND a.property_id = b.property_id AND a.external_id = b.external_id;
-- But for this stress test, we assume clean slate or we let it fail if already polluted.
