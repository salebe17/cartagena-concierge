-- 1. Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, kyc_status)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'user', -- Default role
    'unverified' -- Default KYC status
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Enable Realtime for Orders
-- This effectively tells Supabase to broadcast changes to this table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
