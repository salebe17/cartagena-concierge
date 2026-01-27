-- FIX: Add ALL missing service types to service_type ENUM (NO TRANSACTION BLOCK)
-- Run this script directly in the Supabase SQL Editor.

ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'keys';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'plumbing';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'electricity';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'gas';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'insurance';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'refrigeration';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'laundry';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'houseware';
ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'linens';
