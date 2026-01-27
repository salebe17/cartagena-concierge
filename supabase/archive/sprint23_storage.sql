-- LEVEL 23: Storage Security Hardening
-- We need to secure 'chat-media' which was created ad-hoc in previous steps.

-- 1. Ensure Bucket Exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing loose policies (if any) to reset security state
DROP POLICY IF EXISTS "Chat Media Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Chat Media Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Chat Media Owner Delete" ON storage.objects;

-- 3. Policy: Public Read (Required for <img> tags to work without signed URLs)
-- Ideally we use Signed URLs for privacy, but for this "Stress Test" level, 
-- we at least ensure read is allowed but WRITE is restricted.
CREATE POLICY "Chat Media Public Read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

-- 4. Policy: Authenticated Upload (Must be logged in)
CREATE POLICY "Chat Media Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-media');

-- 5. Policy: Owner ONLY Delete (Prevent IDOR / Malicious Deletion)
-- A user cannot delete someone else's evidence photo.
CREATE POLICY "Chat Media Owner Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-media' AND auth.uid() = owner);

-- 6. Policy: Owner Update (Prevent Overwrite)
CREATE POLICY "Chat Media Owner Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'chat-media' AND auth.uid() = owner);
