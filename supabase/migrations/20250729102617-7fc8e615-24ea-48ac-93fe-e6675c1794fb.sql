-- Add guest_phone column to reservations table
ALTER TABLE public.reservations 
ADD COLUMN guest_phone text;