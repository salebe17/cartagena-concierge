-- LEVEL 11: Rate Limiting & Abuse Prevention

-- 1. Rate Limits Table
-- Transient table to track usage windows
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY, -- e.g. 'req_create_user_UUID_timestamp_minute'
    count INT DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON public.rate_limits(expires_at);

-- 2. Function to Check Rate Limit (Leaky Bucket / Fixed Window)
-- Returns TRUE if allowed, FALSE if blocked
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key_prefix TEXT, 
    p_limit INT, 
    p_window_seconds INT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_window_start TIMESTAMP WITH TIME ZONE;
    v_key TEXT;
    v_count INT;
BEGIN
    -- Define window bucket (e.g. current minute)
    -- For simplicity, we use a sliding expiry key per user/action
    v_key := p_key_prefix;
    
    -- Clean up old records (Optimistic cleanup, or use pg_cron if available)
    -- To avoid locking, we might skip this or do it randomly/periodically.
    -- meaningful cleanup: DELETE FROM public.rate_limits WHERE expires_at < now();
    
    -- Upsert current count
    INSERT INTO public.rate_limits (key, count, expires_at)
    VALUES (v_key, 1, now() + (p_window_seconds || ' seconds')::interval)
    ON CONFLICT (key) DO UPDATE 
    SET count = rate_limits.count + 1
    RETURNING count INTO v_count;
    
    -- Check limit
    IF v_count > p_limit THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 

-- Note: In high traffic, this table grows fast. 
-- A real production app uses Redis. 
-- For this "Stress Test", this proves the logic without external dependencies.
