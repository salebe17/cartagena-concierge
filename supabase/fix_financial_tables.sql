-- FIX: Create Missing Finance Infrastructure (Invoices + Stats RPC)

BEGIN;

-- 1. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'COP',
    status TEXT CHECK (status IN ('unpaid', 'paid', 'void', 'refunded')) DEFAULT 'unpaid',
    stripe_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 2. Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Admins manage invoices" ON public.invoices;
CREATE POLICY "Admins manage invoices"
ON public.invoices FOR ALL TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Users view own invoices" ON public.invoices;
CREATE POLICY "Users view own invoices"
ON public.invoices FOR SELECT TO authenticated
USING (
    service_request_id IN (
        SELECT id FROM public.service_requests WHERE requester_id = auth.uid()
    )
);

-- 4. Create Finance Stats RPC (Used by Admin Dashboard)
CREATE OR REPLACE FUNCTION public.get_finance_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_rev NUMERIC;
    by_service JSONB;
    prop_rev JSONB;
BEGIN
    -- Calculate Total Revenue (Paid)
    SELECT COALESCE(SUM(amount), 0) INTO total_rev
    FROM public.invoices
    WHERE status = 'paid';

    -- Calculate Revenue by Service Type
    SELECT jsonb_object_agg(service_type, total)
    INTO by_service
    FROM (
        SELECT sr.service_type, COALESCE(SUM(i.amount), 0) as total
        FROM public.invoices i
        JOIN public.service_requests sr ON i.service_request_id = sr.id
        WHERE i.status = 'paid'
        GROUP BY sr.service_type
    ) t;

    -- Calculate Revenue by Property
    SELECT jsonb_agg(jsonb_build_object('id', id, 'title', title, 'revenue', revenue))
    INTO prop_rev
    FROM (
        SELECT p.id, p.title, COALESCE(SUM(i.amount), 0) as revenue
        FROM public.invoices i
        JOIN public.service_requests sr ON i.service_request_id = sr.id
        JOIN public.properties p ON sr.property_id = p.id
        WHERE i.status = 'paid'
        GROUP BY p.id, p.title
        ORDER BY revenue DESC
    ) p;

    RETURN jsonb_build_object(
        'total', total_rev,
        'byService', COALESCE(by_service, '{}'::jsonb),
        'propertyRevenue', COALESCE(prop_rev, '[]'::jsonb)
    );
END;
$$;

-- 5. SEED DATA (Generate fake invoices for existing Completed requests)
INSERT INTO public.invoices (service_request_id, amount, status, paid_at)
SELECT 
    id, 
    (random() * 200000 + 50000)::numeric(10,2), -- Random amount 50k - 250k
    'paid',
    updated_at
FROM public.service_requests
WHERE status = 'completed'
AND id NOT IN (SELECT service_request_id FROM public.invoices);

COMMIT;
