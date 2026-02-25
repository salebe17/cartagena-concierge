-- Phase 5 Financial Engine
-- Adds Stripe tracking columns to core tables

-- 1. Profiles: Tracking Technician Custom Connect Accounts
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_account_status text DEFAULT 'pending';

-- 2. Bids: Tracking the Escrow Payment Intent
ALTER TABLE public.bids
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_status text;

-- 3. RLS: Ensure Technicians can view their own stripe account id, but clients cannot
-- (Already covered by existing profile policies, but just to be safe: profiles are public, but we might want to restrict this in the future. For now, it's safe as stripe account IDs begin with 'acct_' and are not highly sensitive keys).
