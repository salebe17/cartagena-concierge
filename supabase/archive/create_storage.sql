-- 1. Create 'evidence' bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow Public Read Access (so Admin can see photos)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'evidence');

-- 3. Allow Authenticated Users (Staff/Admin) to Upload
DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON storage.objects;
CREATE POLICY "Authenticated users can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence');

-- 4. Allow Authenticated Users to Update/Delete their own uploads (Optional but good)
DROP POLICY IF EXISTS "Users can update own evidence" ON storage.objects;
CREATE POLICY "Users can update own evidence"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'evidence' AND auth.uid() = owner);
