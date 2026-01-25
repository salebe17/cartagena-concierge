-- Stripe Customer Mapping
CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id)
);

-- Invoices / Payments
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    service_request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- in COP (or lowest currency unit)
    status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'void'
    stripe_invoice_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Admins can do everything, Users can read their own
CREATE POLICY "Users can view their own stripe mapping" ON stripe_customers
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can view their own invoices" ON invoices
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Admins have full access to stripe_customers" ON stripe_customers
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins have full access to invoices" ON invoices
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
