-- LEVEL 8: Hygiene & Idempotency

-- 1. Soft Delete Support
-- Add deleted_at column to Service Requests
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Soft Delete in RLS (Optional: Hide deleted items from standard queries)
-- We won't force RLS to hide them yet, as we might want an "Archive" view.
-- But we should index it.
CREATE INDEX IF NOT EXISTS idx_requests_deleted_at ON public.service_requests(deleted_at);

-- 3. Idempotency Support for Invoices
-- Ensure we never have multiple paid invoices for the same request
ALTER TABLE public.invoices
ADD CONSTRAINT unique_request_invoice UNIQUE (service_request_id);
