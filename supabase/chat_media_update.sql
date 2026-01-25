-- Chat Media Support Migration

-- 1. Add columns to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text'; -- 'text', 'image', 'file'

-- 2. Create Storage Bucket for Chat Media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies
DROP POLICY IF EXISTS "Auth users can upload chat media" ON storage.objects;
CREATE POLICY "Auth users can upload chat media" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'chat-media'
);

DROP POLICY IF EXISTS "Everyone can view chat media" ON storage.objects;
CREATE POLICY "Everyone can view chat media" ON storage.objects
FOR SELECT TO authenticated USING (
    bucket_id = 'chat-media'
);

-- 3. Update Realtime Publication (handled automatically)
