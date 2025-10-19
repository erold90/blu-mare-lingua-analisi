-- Create archived_reservations table with same structure as reservations
CREATE TABLE IF NOT EXISTS public.archived_reservations (
  id text PRIMARY KEY,
  guest_name text NOT NULL,
  guest_phone text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  apartment_ids jsonb NOT NULL,
  adults integer NOT NULL DEFAULT 1,
  children integer DEFAULT 0,
  cribs integer DEFAULT 0,
  has_pets boolean DEFAULT false,
  linen_option text DEFAULT 'no',
  final_price numeric,
  deposit_amount numeric,
  payment_status text DEFAULT 'notPaid',
  payment_method text,
  notes text,
  device_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  archived_at timestamp with time zone DEFAULT now(),
  archived_year integer NOT NULL
);

-- Enable RLS on archived_reservations
ALTER TABLE public.archived_reservations ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view archived reservations
CREATE POLICY "Only authenticated admins can view archived reservations"
ON public.archived_reservations
FOR SELECT
USING (is_admin());

-- Create policy for admins to manage archived reservations
CREATE POLICY "Only authenticated admins can manage archived reservations"
ON public.archived_reservations
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create index for faster queries by year
CREATE INDEX idx_archived_reservations_year ON public.archived_reservations(archived_year);
CREATE INDEX idx_archived_reservations_dates ON public.archived_reservations(start_date, end_date);

-- Function to archive reservations by year
CREATE OR REPLACE FUNCTION public.archive_reservations_by_year(target_year integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  archived_count integer := 0;
BEGIN
  -- Insert reservations into archived_reservations
  INSERT INTO public.archived_reservations (
    id, guest_name, guest_phone, start_date, end_date, apartment_ids,
    adults, children, cribs, has_pets, linen_option, final_price,
    deposit_amount, payment_status, payment_method, notes, device_id,
    created_at, updated_at, archived_at, archived_year
  )
  SELECT 
    id, guest_name, guest_phone, start_date, end_date, apartment_ids,
    adults, children, cribs, has_pets, linen_option, final_price,
    deposit_amount, payment_status, payment_method, notes, device_id,
    created_at, updated_at, now(), target_year
  FROM public.reservations
  WHERE EXTRACT(YEAR FROM start_date) = target_year
  ON CONFLICT (id) DO NOTHING;

  GET DIAGNOSTICS archived_count = ROW_COUNT;

  -- Delete archived reservations from active table
  DELETE FROM public.reservations
  WHERE EXTRACT(YEAR FROM start_date) = target_year;

  RETURN archived_count;
END;
$$;

-- Add comment to function
COMMENT ON FUNCTION public.archive_reservations_by_year IS 'Archives reservations for a specific year, moving them from reservations to archived_reservations table';
