-- LEVEL 5: Storage Security Hardening
-- Current State: "Auth users can upload chat media" (Too permissive: anyone can upload anything anywhere in the bucket)

-- 1. Tighten Upload Policy
DROP POLICY IF EXISTS "Auth users can upload chat media" ON storage.objects;

-- Allow upload ONLY if:
-- a) Bucket is chat-media
-- b) Folder path matches their User ID (Isolation) OR they are Admin
-- c) They are NOT overwriting an existing file (Prevent destruction)
CREATE POLICY "Secure Upload for Chat" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'chat-media' AND
    (
        (storage.foldername(name))[1] = auth.uid()::text OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
);

-- 2. Prevent Deletion/Update by default users (Immutable History)
-- Only Admins should be able to delete chat media if needed.
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects; -- If exists
CREATE POLICY "Admins can delete chat media" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'chat-media' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Size Limit (Optional, often done continuously via Postgres config or Middleware, but RLS can't easily check size pre-upload without metadata)
-- Supabase Storage settings usually handle size limits (e.g. 5MB)
-- usage: Ensure client sends file to `chat-media/{userId}/{timestamp}.ext`
