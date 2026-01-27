-- LEVEL 19: Performance Tuning (Indexing)

-- 1. Index Foreign Keys for Service Requests
-- Used mainly for filtering by property or status
CREATE INDEX IF NOT EXISTS idx_service_requests_property_id ON public.service_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at);

-- 2. Index Foreign Keys for Logs
CREATE INDEX IF NOT EXISTS idx_service_logs_request_id ON public.service_logs(service_request_id);

-- 3. Index Foreign Keys for Invoices (Critical for Finance API)
CREATE INDEX IF NOT EXISTS idx_invoices_profile_id ON public.invoices(profile_id);
CREATE INDEX IF NOT EXISTS idx_invoices_request_id ON public.invoices(service_request_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 4. Chat Messages Indexing
-- Queries filter by request_id OR (sender/receiver)
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(service_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_participants ON public.messages(sender_id, receiver_id);

-- 5. Bookings Indexing (Calendar Sync)
CREATE INDEX IF NOT EXISTS idx_bookings_property_date ON public.bookings(property_id, start_date);
