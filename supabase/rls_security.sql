-- 1. Add missing 'driver_id' column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id);

-- 2. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. Cleanup existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Public Read" ON profiles;
DROP POLICY IF EXISTS "Self Update" ON profiles;

DROP POLICY IF EXISTS "Users can view their own orders." ON orders;
DROP POLICY IF EXISTS "Drivers can view paid/assigned orders." ON orders;
DROP POLICY IF EXISTS "Users can insert orders." ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders." ON orders;
DROP POLICY IF EXISTS "Create Order" ON orders;
DROP POLICY IF EXISTS "Client View Own" ON orders;
DROP POLICY IF EXISTS "Driver View Available" ON orders;
DROP POLICY IF EXISTS "Driver View Assigned" ON orders;
DROP POLICY IF EXISTS "Driver Update Status" ON orders;
DROP POLICY IF EXISTS "Client Cancel" ON orders;

-- ==========================================
-- PROFILES TABLE POLICIES
-- ==========================================

-- Policy "Public Read": Any authenticated user can view basic profile info
CREATE POLICY "Public Read" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- Policy "Self Update": Users can only update their own profile
CREATE POLICY "Self Update" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ==========================================
-- ORDERS TABLE POLICIES
-- ==========================================

-- Policy "Create Order": Any authenticated user can INSERT a row (as matching user_id)
CREATE POLICY "Create Order" 
ON orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy "Client View Own": Users can SELECT rows where they are the creator
CREATE POLICY "Client View Own" 
ON orders FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Policy "Driver View Available": specialized view for pending orders
CREATE POLICY "Driver View Available" 
ON orders FOR SELECT 
TO authenticated 
USING (
  status = 'pending' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'driver')
);

-- Policy "Driver View Assigned": specialized view for their assigned orders
CREATE POLICY "Driver View Assigned" 
ON orders FOR SELECT 
TO authenticated 
USING (driver_id = auth.uid());

-- Policy "Driver Update Status": Drivers can UPDATE rows where they are assigned
-- (Note: This allows updating status or other fields if assigned)
CREATE POLICY "Driver Update Status" 
ON orders FOR UPDATE 
TO authenticated 
USING (driver_id = auth.uid());

-- Policy "Driver Claim": EXTRA POLICY (Required for App Functionality)
-- Allows a driver to claim a pending order by setting themselves as driver_id
CREATE POLICY "Driver Claim"
ON orders FOR UPDATE
TO authenticated
USING (
  status = 'pending' AND
  driver_id IS NULL AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'driver')
)
WITH CHECK (
  driver_id = auth.uid()
);


-- Policy "Client Cancel": Clients can UPDATE to cancel if pending
CREATE POLICY "Client Cancel" 
ON orders FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid() AND status = 'cancelled');
