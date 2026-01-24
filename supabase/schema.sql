-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT, -- Added for "Remember Me" functionality
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
  client_phone TEXT, -- Contact number for this specific order
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

-- Properties Table (Soporta múltiples propiedades por usuario)
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  size_sqm INT,
  image_url TEXT,
  ical_url TEXT, -- Para sincronización de Airbnb/Booking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad (Multi-tenancy)
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own properties" ON properties;
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (auth.uid() = owner_id);

-- Bookings Table (Calendar)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guest_name TEXT,
  status TEXT CHECK (status IN ('confirmed', 'pending', 'blocked', 'maintenance')) DEFAULT 'confirmed',
  platform TEXT DEFAULT 'Direct', -- Airbnb, Booking, etc.
  external_id TEXT, -- iCal UID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own property bookings" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE id = bookings.property_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can manage own property bookings" ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM properties WHERE id = bookings.property_id AND owner_id = auth.uid())
);

-- Alerts Table (Notifications)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, warning, success
  status TEXT CHECK (status IN ('read', 'unread')) DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts" ON alerts FOR ALL USING (auth.uid() = user_id);
