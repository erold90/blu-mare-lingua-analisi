-- Remove public access to bookings table to protect guest privacy
DROP POLICY IF EXISTS "Public can view confirmed bookings" ON public.bookings;