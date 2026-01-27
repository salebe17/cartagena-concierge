-- LEVEL 6: Abuse Prevention (Rate Limiting)

-- 1. Create Rate Limits Table
-- This table tracks the number of actions a user performs within a time window.
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'chat_message', 'create_request'
    window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    count INTEGER DEFAULT 1,
    UNIQUE(user_id, action_type)
);

-- 2. Function to Check & Increment Rate Limit
-- Returns true if allowed, false if limit exceeded.
-- Window size: 1 minute.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id UUID,
    p_action_type TEXT,
    p_max_count INTEGER,
    p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current usage
    SELECT count, window_start INTO v_count, v_window_start
    FROM public.rate_limits
    WHERE user_id = p_user_id AND action_type = p_action_type;

    -- If no record, insert new
    IF NOT FOUND THEN
        INSERT INTO public.rate_limits (user_id, action_type, window_start, count)
        VALUES (p_user_id, p_action_type, now(), 1);
        RETURN TRUE;
    END IF;

    -- Check if window expired
    IF now() > (v_window_start + (p_window_seconds || ' seconds')::interval) THEN
        -- Reset window
        UPDATE public.rate_limits
        SET window_start = now(), count = 1
        WHERE user_id = p_user_id AND action_type = p_action_type;
        RETURN TRUE;
    END IF;

    -- Check limit
    IF v_count >= p_max_count THEN
        RETURN FALSE; -- Limit exceeded
    ELSE
        -- Increment
        UPDATE public.rate_limits
        SET count = count + 1
        WHERE user_id = p_user_id AND action_type = p_action_type;
        RETURN TRUE;
    END IF;
END;
$$;
