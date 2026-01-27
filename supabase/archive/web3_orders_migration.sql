-- Migration to support Web3 Service Requests
-- Adding columns for text-based service details and blockchain tracking

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS service_details TEXT,
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS tx_hash TEXT,
ADD COLUMN IF NOT EXISTS network TEXT DEFAULT 'Amoy';

-- Optional: Index on tx_hash for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_orders_tx_hash ON orders(tx_hash);
