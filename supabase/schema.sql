-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('user', 'driver', 'admin')) DEFAULT 'user',
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  service_fee NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'assigned', 'picked_up', 'delivered', 'cancelled')) DEFAULT 'pending',
  delivery_code TEXT NOT NULL,
  location_lat FLOAT,
  location_lng FLOAT,
  distance_km FLOAT,
  signature_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders Policies
CREATE POLICY "Users can view their own orders." ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can view paid/assigned orders." ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'driver' AND (orders.status IN ('paid', 'assigned', 'picked_up')))
);
CREATE POLICY "Users can insert orders." ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: Drivers updating orders would require more specific policies or RPCs. 
-- For this demo, we might allow authenticated updates if complexity is high, 
-- but ideally strict checks. 
-- ALLOW UPDATE for drivers on specific columns? 
-- Simplification: Allow all authenticated users to update (Security risk in real app, but allows demo driver flow).
CREATE POLICY "Authenticated users can update orders." ON orders FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'driver'));
