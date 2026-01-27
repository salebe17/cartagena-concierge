-- Fix for "violates check constraint" error
-- We need to allow 'in_transit' status

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'paid', 'assigned', 'in_transit', 'picked_up', 'delivered', 'cancelled'));
