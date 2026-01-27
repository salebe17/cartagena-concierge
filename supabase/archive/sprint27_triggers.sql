-- LEVEL 27: Auto-Update Triggers (Data Hygiene)
-- Ensures 'updated_at' is always fresh without app logic intervention.

BEGIN;

-- 1. Enable Extension
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- 2. Ensure Columns Exist (Safe Add)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Create Triggers (Idempotent approach)
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE extensions.moddatetime (updated_at);

DROP TRIGGER IF EXISTS handle_updated_at ON public.properties;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE PROCEDURE extensions.moddatetime (updated_at);

DROP TRIGGER IF EXISTS handle_updated_at ON public.service_requests;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE PROCEDURE extensions.moddatetime (updated_at);

COMMIT;
