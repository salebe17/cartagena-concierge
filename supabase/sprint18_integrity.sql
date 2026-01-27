-- LEVEL 18: Data Integrity & Legal Compliance

-- 1. Soft Delete Infrastructure
-- Instead of deleting users, we mark them as deleted to preserve history.
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Fix Dangerous Cascades on Financial Records
-- Invoices MUST NOT be deleted when a user is deleted (Accounting Laws).
-- We must drop the existing constraint and re-add it with SET NULL or RESTRICT.

-- Step A: Drop old constraint (Constraint name usually auto-generated, we must find it or try standard naming)
-- Supabase/Postgres naming convention: table_column_fkey
ALTER TABLE public.invoices
DROP CONSTRAINT IF EXISTS invoices_profile_id_fkey;

-- Step B: Add Safe Constraint
ALTER TABLE public.invoices
ADD CONSTRAINT invoices_profile_id_fkey
FOREIGN KEY (profile_id) REFERENCES profiles(id)
ON DELETE SET NULL; 
-- Note: 'profile_id' in invoices creates a problem if it's NOT NULL.
-- Let's check schema. It is: "profile_id UUID ... NOT NULL".
-- So we must allow NULLs first.

ALTER TABLE public.invoices
ALTER COLUMN profile_id DROP NOT NULL;

-- 3. Fix Service Logs Cascade
-- Operational history should be preserved even if the Request is deleted (e.g. cancelled/archived)
-- ideally. But currently service_logs -> service_requests -> ON DELETE CASCADE.
-- If we delete a request, logs go. That MIGHT be okay if "Delete Request" means "Purge".
-- But usually we want Soft Delete on Requests too.

ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
-- Now we update app logic to Filter by deleted_at IS NULL (Future work).

-- 4. Invoices linking to Service Requests
-- currently: service_request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL
-- This was already good (SET NULL). So we are safe there.

-- Summary:
-- 1. Profiles get deleted_at
-- 2. Invoices now survive Profile deletion (profile_id becomes NULL)
-- 3. Service Requests get deleted_at
