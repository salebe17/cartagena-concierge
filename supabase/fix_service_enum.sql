-- FIX: Add 'interior_finishes' to service_type ID
-- The frontend is sending 'interior_finishes', but the Postgres ENUM rejected it.

BEGIN;

-- Attempt to add the value. 
-- Note: 'ALTER TYPE ... ADD VALUE' cannot be run inside a transaction block in some Postgres versions, 
-- but Supabase usually handles it if run via the SQL Editor. 
-- IF it fails, we will have to run it without BEGIN/COMMIT in the editor.
-- Checking existence first isn't possible with ADD VALUE directly in standard SQL without unsafe PL/pgSQL hacks.
-- We will assume standard execution.

ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'interior_finishes';

COMMIT;
