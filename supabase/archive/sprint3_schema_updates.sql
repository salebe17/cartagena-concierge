-- Link service_requests to staff_members
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL;

-- Link service_logs to staff_members
ALTER TABLE service_logs
ADD COLUMN IF NOT EXISTS staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL;
