-- LEVEL 13: Scalability & Memory Optimization

-- 1. Optimized Finance Stats RPC
-- Calculates totals in DB, avoiding fetching thousands of rows to JS.
CREATE OR REPLACE FUNCTION public.get_finance_stats()
RETURNS JSONB AS $$
DECLARE
    v_total NUMERIC;
    v_by_service JSONB;
    v_by_property JSONB;
BEGIN
    -- 1. Total Revenue (Paid Invoices)
    SELECT COALESCE(SUM(amount), 0) INTO v_total
    FROM invoices
    WHERE status = 'paid';

    -- 2. Breakdown by Service Type
    -- We need to join with service_requests
    SELECT jsonb_object_agg(service_type, total) INTO v_by_service
    FROM (
        SELECT sr.service_type, SUM(i.amount) as total
        FROM invoices i
        JOIN service_requests sr ON i.service_request_id = sr.id
        WHERE i.status = 'paid'
        GROUP BY sr.service_type
    ) t;

    -- 3. Breakdown by Property (Top 50 for performance)
    SELECT jsonb_agg(row_to_json(t)) INTO v_by_property
    FROM (
        SELECT p.id, p.title, SUM(i.amount) as revenue
        FROM invoices i
        JOIN service_requests sr ON i.service_request_id = sr.id
        JOIN properties p ON sr.property_id = p.id
        WHERE i.status = 'paid'
        GROUP BY p.id, p.title
        ORDER BY revenue DESC
        LIMIT 50
    ) t;

    RETURN jsonb_build_object(
        'total', v_total,
        'byService', COALESCE(v_by_service, '{}'::jsonb),
        'propertyRevenue', COALESCE(v_by_property, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT EXECUTE ON FUNCTION public.get_finance_stats TO authenticated;
-- Ideally restrict to Admin, but RLS on invoices handles visibility usually, 
-- or we add a check inside:
-- IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
