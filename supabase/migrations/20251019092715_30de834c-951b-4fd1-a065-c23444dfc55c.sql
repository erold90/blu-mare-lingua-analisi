-- Drop existing SELECT policy on website_visits
DROP POLICY IF EXISTS "Only authenticated admins can view visits" ON public.website_visits;

-- Create more secure SELECT policy that explicitly denies non-admin access
CREATE POLICY "Only authenticated admins can view visits"
ON public.website_visits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Add explicit deny policy for anonymous users trying to SELECT
CREATE POLICY "Anonymous users cannot view visits"
ON public.website_visits
FOR SELECT
TO anon
USING (false);

-- Ensure no other SELECT policies exist
-- The combination of these policies ensures:
-- 1. Anonymous users are explicitly denied SELECT access
-- 2. Authenticated non-admin users are denied SELECT access (policy returns false)
-- 3. Only authenticated admin users can SELECT

COMMENT ON POLICY "Only authenticated admins can view visits" ON public.website_visits 
IS 'Restricts SELECT access to authenticated users who are admins only - protects sensitive visitor tracking data (IP addresses, geolocation, browsing behavior) from unauthorized access';

COMMENT ON POLICY "Anonymous users cannot view visits" ON public.website_visits 
IS 'Explicitly denies all anonymous SELECT access to visitor tracking data for GDPR compliance';