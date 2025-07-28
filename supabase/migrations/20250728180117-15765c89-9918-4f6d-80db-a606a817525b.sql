-- Add RLS policies for reservations table to allow admin access

-- Enable RLS on reservations table
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to view all reservations
CREATE POLICY "Admins can view all reservations" 
ON public.reservations 
FOR SELECT 
USING (true); -- For now, allow all access since we don't have user authentication

-- Policy to allow admins to insert reservations
CREATE POLICY "Admins can insert reservations" 
ON public.reservations 
FOR INSERT 
WITH CHECK (true);

-- Policy to allow admins to update reservations
CREATE POLICY "Admins can update reservations" 
ON public.reservations 
FOR UPDATE 
USING (true);

-- Policy to allow admins to delete reservations
CREATE POLICY "Admins can delete reservations" 
ON public.reservations 
FOR DELETE 
USING (true);