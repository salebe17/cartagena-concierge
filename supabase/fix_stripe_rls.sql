-- Fix RLS for Stripe Customers table
-- Allows users to insert their own mapping record.

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- 1. Allow users to insert their own mapping
CREATE POLICY "Users can insert their own stripe customer mapping"
ON stripe_customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

-- 2. Allow users to read their own mapping
CREATE POLICY "Users can view their own stripe customer mapping"
ON stripe_customers
FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- 3. Allow Service Role full access (Just in case)
CREATE POLICY "Service Role has full access to stripe_customers"
ON stripe_customers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
