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
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders Policies
DROP POLICY IF EXISTS "Users can view their own orders." ON orders;
CREATE POLICY "Users can view their own orders." ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Drivers can view paid/assigned orders." ON orders;
CREATE POLICY "Drivers can view paid/assigned orders." ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'driver' AND (orders.status IN ('paid', 'assigned', 'picked_up')))
);

DROP POLICY IF EXISTS "Users can insert orders." ON orders;
CREATE POLICY "Users can insert orders." ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can update orders." ON orders;
CREATE POLICY "Authenticated users can update orders." ON orders FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'driver'));

-- =========================================================
-- MASTER PROPERTIES TABLE (1 Host -> N Properties)
-- =========================================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,          -- Ej: "Edificio Morros Epic 902"
    address TEXT NOT NULL,        -- Ej: "La Boquilla"
    image_url TEXT,               -- Foto de portada
    status TEXT DEFAULT 'vacant', -- 'vacant' | 'occupied'
    ical_url TEXT,                -- Para sincronizar Airbnb a futuro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- MASTER PROPERTIES TABLE (1 Host -> N Properties)
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can update own properties" ON properties;
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================
-- SERVICE REQUESTS TABLE (Limpieza, Mantenimiento)
-- =========================================================
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    service_type TEXT NOT NULL,   -- 'cleaning', 'maintenance', 'concierge'
    notes TEXT,                   -- "Sábanas extra por favor"
    requested_date TIMESTAMP WITH TIME ZONE, 
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage requests for own properties" ON service_requests;
CREATE POLICY "Users can manage requests for own properties" ON service_requests FOR ALL USING (
    property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =========================================================
-- ALERTS TABLE (Notificaciones)
-- =========================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'pending_service', 'info', 'warning'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alerts" ON alerts;
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON alerts;
CREATE POLICY "Users can update own alerts" ON alerts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System/Admin can insert alerts" ON alerts;
CREATE POLICY "System/Admin can insert alerts" ON alerts FOR INSERT WITH CHECK (true); -- Simplified for actions usage

