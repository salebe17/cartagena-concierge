-- Migration: Phase 2 - Advanced Database Optimizations (Master Plan)

-- 1. Enable PostGIS Extension for Geolocation (Radar)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Add Soft Deletes (GDPR Compliance) and Optimistic Concurrency (Race Conditions)
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS location_geom geography(POINT, 4326); -- For PostGIS radius searches

ALTER TABLE public.bids 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cached_rating NUMERIC(3, 2) DEFAULT 5.00, -- Desnormalización (Paso 19)
ADD COLUMN IF NOT EXISTS total_jobs_completed INTEGER DEFAULT 0;

-- 3. Trigger for Optimistic Concurrency
-- Automatically increments the 'version' column on updates to prevent Lost Updates.
CREATE OR REPLACE FUNCTION public.increment_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_service_requests_version ON public.service_requests;
CREATE TRIGGER trg_service_requests_version
    BEFORE UPDATE ON public.service_requests
    FOR EACH ROW EXECUTE PROCEDURE public.increment_version();

DROP TRIGGER IF EXISTS trg_bids_version ON public.bids;
CREATE TRIGGER trg_bids_version
    BEFORE UPDATE ON public.bids
    FOR EACH ROW EXECUTE PROCEDURE public.increment_version();

-- 4. Advanced B-Tree and GiST Indexes
-- Accelerate queries by status and user (B-Tree)
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_requests_requester ON public.service_requests(requester_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bids_request_id ON public.bids(request_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bids_technician_id ON public.bids(technician_id) WHERE deleted_at IS NULL;

-- Accelerate spatial queries (Radar de Técnicos) using GiST
CREATE INDEX IF NOT EXISTS idx_service_requests_location_geom ON public.service_requests USING GIST (location_geom);

-- 5. Materialized View for Financial / Technician Dashboard
-- Refreshed asynchronously to avoid heavy COUNT() queries on the fly
DROP MATERIALIZED VIEW IF EXISTS public.technician_financial_stats;
CREATE MATERIALIZED VIEW public.technician_financial_stats AS
SELECT 
    technician_id,
    COUNT(*) as total_bids_placed,
    SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as total_bids_won,
    SUM(CASE WHEN status = 'accepted' THEN amount ELSE 0 END) as potential_revenue,
    MAX(created_at) as last_active
FROM public.bids
WHERE deleted_at IS NULL
GROUP BY technician_id;

-- Create unique index to allow CONCURRENTLY refreshing
CREATE UNIQUE INDEX IF NOT EXISTS idx_mat_view_tech_id ON public.technician_financial_stats(technician_id);

-- 6. RPC to refresh materialized view from Edge Functions
CREATE OR REPLACE FUNCTION public.refresh_technician_stats()
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.technician_financial_stats;
END;
$$ LANGUAGE plpgsql;

-- 7. Update RLS Policies to respect Soft Deletes (deleted_at IS NULL)
-- Drop existing policies first
DROP POLICY IF EXISTS "Clients can see bids on their requests" ON public.bids;
CREATE POLICY "Clients can see bids on their requests" ON public.bids FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
        SELECT 1 FROM public.service_requests
        WHERE public.service_requests.id = public.bids.request_id
        AND public.service_requests.requester_id = auth.uid()
        AND public.service_requests.deleted_at IS NULL
    )
);

DROP POLICY IF EXISTS "Technicians can see their own bids" ON public.bids;
CREATE POLICY "Technicians can see their own bids" ON public.bids FOR SELECT USING (
    technician_id = auth.uid() AND deleted_at IS NULL
);
