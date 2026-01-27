-- FIX: Add 'interior_finishes' to service_type ID (NO TRANSACTION BLOCK)
-- Postgres 'ALTER TYPE ... ADD VALUE' cannot run inside a transaction block.
-- Run this script directly in the Supabase SQL Editor.

ALTER TYPE public.service_type ADD VALUE IF NOT EXISTS 'interior_finishes';
