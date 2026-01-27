
-- 1. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage requests for own properties" ON service_requests;
DROP POLICY IF EXISTS "Users can view own properties" ON properties;

-- 2. Re-create Properties Policy (Admin Access)
CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Re-create Service Requests Policy (Admin Access)
CREATE POLICY "Users can manage requests for own properties" ON service_requests FOR ALL USING (
    property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Verify Policy Existence
SELECT * FROM pg_policies WHERE tablename = 'service_requests';
