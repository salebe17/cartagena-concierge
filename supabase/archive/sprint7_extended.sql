-- LEVEL 7 Extended: Security & Logic Hardening

-- 1. Mass Assignment Protection (Critical)
-- Users should NOT be able to change their own 'role' or 'kyc_status' via the standard Update policy.
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- If the role is changing
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Allow only if the user is a service_role (Admin API) or has admin claim
        -- Ideally, we check if the executing user is an admin.
        -- BUT standard RLS/Triggers run as the user.
        -- We can check if `auth.uid()` matches a profile with role 'admin' OR if it's a superuser.
        -- Simplest: Only allow if it's the Service Role (which bypasses RLS, but Triggers run).
        -- Actually, for now, let's just SAY: Users cannot change their own role.
        -- If an Admin changes it via API with service_role key, it works.
        -- If an Admin changes it via Client with their own Auth, they are a user.
        
        -- Check if the actor is an admin
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
             RAISE EXCEPTION 'You cannot change your own role.';
        END IF;
    END IF;

    -- Improve: Protect KYC Status too
    IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status THEN
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
             RAISE EXCEPTION 'You cannot verify yourself.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
CREATE TRIGGER on_profile_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.protect_profile_fields();

-- 2. Safe Deletion for Service Requests
-- Hosts should not be able to delete a request that is 'in_progress' or 'completed'.
-- They should only be able to delete 'pending' or 'cancelled'.
CREATE OR REPLACE FUNCTION public.check_request_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('in_progress', 'completed', 'paid') THEN
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
            RAISE EXCEPTION 'Cannot delete an active or completed request. Please cancel it first or contact support.';
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_request_delete ON public.service_requests;
CREATE TRIGGER on_request_delete
BEFORE DELETE ON public.service_requests
FOR EACH ROW
EXECUTE PROCEDURE public.check_request_deletion();
