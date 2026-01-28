-- 💎 MARKETPLACE SCHEMA: ALLIES & REFERRALS (Zero Liability Model)

-- 1. ALLIES: The external providers (Boats, Chefs, Transport)
CREATE TABLE IF NOT EXISTS allies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('transport', 'chef', 'boat', 'wellness', 'tours', 'other')),
    description TEXT,
    contact_phone TEXT NOT NULL, -- For the bridge/proxy
    contact_email TEXT,
    commission_rate NUMERIC(5,2) DEFAULT 10.00, -- e.g., 10%
    is_active BOOLEAN DEFAULT true,
    
    -- LIABILITY SHIELD: Terms acceptance
    liability_terms_accepted_at TIMESTAMPTZ,
    
    -- CONTENT
    image_url TEXT,
    perk_description TEXT NOT NULL DEFAULT '5% OFF', -- The "Hook" for the guest
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REFERRALS: The "Bridge" / Tracking Token
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE, -- The "Ticket": e.g., BOAT-8821
    
    -- RELATIONSHIPS
    host_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Who generated it
    ally_id UUID REFERENCES allies(id) ON DELETE SET NULL, -- Who provides service
    
    -- STATUS
    status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'viewed_by_ally', 'redeemed', 'paid', 'cancelled')),
    
    -- METADATA
    guest_name TEXT, -- Optional, if Host provides it
    estimated_value NUMERIC(10,2), -- How much we expect the service cost
    actual_value NUMERIC(10,2), -- How much it actually cost (filled by Ally)
    commission_amount NUMERIC(10,2), -- Our cut
    
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    redeemed_at TIMESTAMPTZ
);

-- 3. RLS POLICIES
ALTER TABLE allies ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Allies: Visible to all Authenticated Hosts
CREATE POLICY "Hosts can view active allies" ON allies
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Referrals: Hosts see their own
CREATE POLICY "Hosts see own referrals" ON referrals
    FOR SELECT TO authenticated
    USING (host_id = auth.uid());

CREATE POLICY "Hosts can generate referrals" ON referrals
    FOR INSERT TO authenticated
    WITH CHECK (host_id = auth.uid());

-- 4. Audit / Logs (Optional but good for disputes)
CREATE TABLE IF NOT EXISTS marketplace_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID REFERENCES referrals(id),
    action TEXT NOT NULL, -- 'contact_revealed', 'whatsapp_opened'
    actor_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
