-- FIX: Missing 'status' column in Properties table
-- The frontend allows toggling vacant/occupied status, but the DB column was missing.

BEGIN;

-- Add column if it doesn't exist
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'vacant' 
CHECK (status IN ('vacant', 'occupied'));

COMMIT;
