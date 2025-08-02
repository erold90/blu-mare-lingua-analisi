-- Security fixes for single-admin setup
-- Fix 1: Remove old admin_users table and unify admin system
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Fix 2: Update is_admin function to only use admin_profiles
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE admin_profiles.user_id = is_admin.user_id
  );
END;
$$;

-- Fix 3: Update RLS policies to require proper authentication
-- Update bookings policies
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
CREATE POLICY "Only authenticated admins can manage bookings" 
ON public.bookings 
FOR ALL 
TO authenticated
USING (is_admin()) 
WITH CHECK (is_admin());

-- Update pricing_periods policies  
DROP POLICY IF EXISTS "Admins can manage pricing periods" ON public.pricing_periods;
CREATE POLICY "Only authenticated admins can manage pricing periods" 
ON public.pricing_periods 
FOR ALL 
TO authenticated
USING (is_admin()) 
WITH CHECK (is_admin());

-- Update website_visits policies
DROP POLICY IF EXISTS "Admins can view visits" ON public.website_visits;
CREATE POLICY "Only authenticated admins can view visits" 
ON public.website_visits 
FOR SELECT 
TO authenticated
USING (is_admin());

-- Fix 4: Update admin-only table policies to require authentication
DROP POLICY IF EXISTS "Admins can manage date blocks" ON public.date_blocks;
CREATE POLICY "Only authenticated admins can manage date blocks" 
ON public.date_blocks 
FOR ALL 
TO authenticated
USING (is_admin()) 
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can upload images" ON public.images;
DROP POLICY IF EXISTS "Admins can update images" ON public.images;  
DROP POLICY IF EXISTS "Admins can delete images" ON public.images;

CREATE POLICY "Only authenticated admins can manage images" 
ON public.images 
FOR ALL 
TO authenticated
USING (is_admin()) 
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can manage weekly prices" ON public.weekly_prices;
CREATE POLICY "Only authenticated admins can manage weekly prices" 
ON public.weekly_prices 
FOR ALL 
TO authenticated
USING (is_admin()) 
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can manage season config" ON public.season_config;
CREATE POLICY "Only authenticated admins can manage season config" 
ON public.season_config 
FOR ALL 
TO authenticated
USING (is_admin()) 
WITH CHECK (is_admin());

-- Fix 5: Update quote_requests policies to be more restrictive for admin operations
DROP POLICY IF EXISTS "Admins can view all quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins can update quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins can delete quote requests" ON public.quote_requests;

CREATE POLICY "Only authenticated admins can view quote requests" 
ON public.quote_requests 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Only authenticated admins can update quote requests" 
ON public.quote_requests 
FOR UPDATE 
TO authenticated
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Only authenticated admins can delete quote requests" 
ON public.quote_requests 
FOR DELETE 
TO authenticated
USING (is_admin());