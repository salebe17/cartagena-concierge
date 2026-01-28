-- 📅 HYBRID MARKETPLACE: RESERVATIONS SUPPORT

-- 1. Modify ALLIES to support dual mode
ALTER TABLE allies ADD COLUMN IF NOT EXISTS requires_reservation BOOLEAN DEFAULT false;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS reservation_instructions TEXT DEFAULT 'Indica fecha, hora y número de personas.';

-- 2. RESERVATIONS Table (Linked to Referrals)
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES profiles(id),
    ally_id UUID REFERENCES allies(id),
    referral_id UUID REFERENCES referrals(id), -- The code is generated AFTER approval
    
    -- GUEST DETAILS
    guest_name TEXT NOT NULL,
    guest_count INTEGER,
    requested_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    
    -- STATUS FLOW
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts see own reservations" ON reservations
    FOR SELECT TO authenticated
    USING (host_id = auth.uid());

CREATE POLICY "Hosts can create reservations" ON reservations
    FOR INSERT TO authenticated
    WITH CHECK (host_id = auth.uid());

-- 4. Sample Update for Testing (Set some allies to require reservation)
-- Let's assume 'Chef' and 'Wellness' need reservation, but Transport/Boat might not (or might).
-- For this demo, let's make the Chef require reservation.
UPDATE allies SET requires_reservation = true WHERE category IN ('chef', 'wellness');
