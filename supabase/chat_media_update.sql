-- Chat Media Support Migration

-- 1. Add columns to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text'; -- 'text', 'image', 'file'

-- 2. Create Storage Bucket for Chat Media
-- Note: You'll need to create the bucket 'chat-media' in the Supabase Dashboard manually if this script fails to create it via API, 
-- but we can set policies here assuming it exists or will exist.

-- (Optional) Insert bucket into storage.buckets if using Supabase local or self-hosted, 
-- but for Supabase Cloud this is usually done via API/Dashboard. 
-- We will focus on Policies.

-- Policy: Anyone authenticated can upload to chat-media (for valid conversation participants)
-- Ideally we check if they are part of a conversation, but for MVP we allow auth users to upload.

-- DROP POLICY IF EXISTS "Auth users can upload chat media" ON storage.objects;
-- CREATE POLICY "Auth users can upload chat media" ON storage.objects
-- FOR INSERT WITH CHECK (
--     bucket_id = 'chat-media' AND 
--     auth.role() = 'authenticated'
-- );

-- DROP POLICY IF EXISTS "Everyone can view chat media" ON storage.objects;
-- CREATE POLICY "Everyone can view chat media" ON storage.objects
-- FOR SELECT USING (
--     bucket_id = 'chat-media'
-- );

-- 3. Update Realtime Publication if needed (usually handles new columns automatically)
