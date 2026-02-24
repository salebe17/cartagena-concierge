-- Migration: Pivot to Bidding Marketplace
-- Add new roles if they don't exist
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'technician';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'client';

-- Modify service_requests table
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS offered_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS accepted_bid_id UUID; -- Will add FK constraint later to avoid circular dependency

-- Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add foreign key to service_requests
ALTER TABLE public.service_requests
ADD CONSTRAINT fk_accepted_bid
FOREIGN KEY (accepted_bid_id) REFERENCES public.bids(id) ON DELETE SET NULL;

-- Ensure moddatetime trigger on bids
DROP TRIGGER IF EXISTS handle_updated_at ON public.bids;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.bids FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- RLS for Bids
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- 1. Clients can see bids on their requests
DROP POLICY IF EXISTS "Clients can see bids on their requests" ON public.bids;
CREATE POLICY "Clients can see bids on their requests" ON public.bids FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.service_requests
        WHERE public.service_requests.id = public.bids.request_id
        AND public.service_requests.requester_id = auth.uid()
    )
);

-- 2. Technicians can see their own bids
DROP POLICY IF EXISTS "Technicians can see their own bids" ON public.bids;
CREATE POLICY "Technicians can see their own bids" ON public.bids FOR SELECT USING (
    technician_id = auth.uid()
);

-- 3. Technicians can insert their own bids
DROP POLICY IF EXISTS "Technicians can create bids" ON public.bids;
CREATE POLICY "Technicians can create bids" ON public.bids FOR INSERT WITH CHECK (
    technician_id = auth.uid()
);

-- 4. Technicians can update their own pending bids
DROP POLICY IF EXISTS "Technicians can update their pending bids" ON public.bids;
CREATE POLICY "Technicians can update their pending bids" ON public.bids FOR UPDATE USING (
    technician_id = auth.uid() AND status = 'pending'
);

-- Note: When a client accepts a bid, we need a secure way to update the bid status.
-- This might require a database function bypassing RLS or letting clients update bids on their requests.
DROP POLICY IF EXISTS "Clients can update bids on their requests" ON public.bids;
CREATE POLICY "Clients can update bids on their requests" ON public.bids FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.service_requests
        WHERE public.service_requests.id = public.bids.request_id
        AND public.service_requests.requester_id = auth.uid()
    )
);

-- Add realtime for bids and service_requests to support live updates
-- Check if realtime is enabled for the tables and add if not.
-- The simplest way is to recreate the publication if it exists.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'bids'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'service_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Fallback for environments where publication isn't set up yet or errors out
    RAISE NOTICE 'Skipped realtime publication addition.';
END $$;
