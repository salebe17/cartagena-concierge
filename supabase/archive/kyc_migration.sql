-- Add KYC columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status TEXT CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')) DEFAULT 'unverified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_id_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_selfie_url TEXT;

-- Create Storage Bucket for KYC Documents (if extension enabled/permissions allow)
-- Note: This often requires the storage schema to be accessible.
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', true);

-- Storage Policies
create policy "Authenticated users can upload KYC"
on storage.objects for insert
with check ( bucket_id = 'kyc-documents' AND auth.uid() = owner );

create policy "Users can view own KYC files"
on storage.objects for select
using ( bucket_id = 'kyc-documents' AND (auth.uid() = owner OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')) );
