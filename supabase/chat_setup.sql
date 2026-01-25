-- 1. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Null means "Support/Admins"
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 3. RLS Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3.1 Admins can read everything
CREATE POLICY "Admins can read all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 3.2 Users can read their own messages 
CREATE POLICY "Users can read their own conversation"
ON public.messages
FOR SELECT
TO authenticated
USING (
    sender_id = auth.uid() OR
    receiver_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.service_requests sr
        JOIN public.properties p ON sr.property_id = p.id
        WHERE sr.id = service_request_id AND p.owner_id = auth.uid()
    )
);

-- 3.3 authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id
);

-- 3.4 Admins can mark as read
CREATE POLICY "Admins can update messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS messages_service_request_id_idx ON public.messages(service_request_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
