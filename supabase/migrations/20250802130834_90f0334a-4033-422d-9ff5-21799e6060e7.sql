-- Fix database function search paths for security
CREATE OR REPLACE FUNCTION public.generate_weekly_prices_for_year(target_year integer, copy_from_year integer DEFAULT NULL::integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  apartment_record RECORD;
  week_record RECORD;
  season_start DATE;
  season_end DATE;
  copy_season_start DATE;
  current_week_start DATE;
  week_counter INTEGER := 1;
  weeks_created INTEGER := 0;
  base_price NUMERIC := 100; -- Default base price
  source_apartment_id TEXT;
  first_week_number_2025 INTEGER;
BEGIN
  -- Get season dates for target year
  SELECT 
    make_date(target_year, season_start_month, season_start_day),
    make_date(target_year, season_end_month, season_end_day)
  INTO season_start, season_end
  FROM public.season_config 
  WHERE year = target_year AND is_active = true
  LIMIT 1;

  -- If no config found, use defaults
  IF season_start IS NULL THEN
    season_start := make_date(target_year, 6, 1);
    season_end := make_date(target_year, 10, 31);
  END IF;

  -- Get copy year season start if copying
  IF copy_from_year IS NOT NULL THEN
    SELECT 
      make_date(copy_from_year, season_start_month, season_start_day)
    INTO copy_season_start
    FROM public.season_config 
    WHERE year = copy_from_year AND is_active = true
    LIMIT 1;
    
    -- If no config, use default
    IF copy_season_start IS NULL THEN
      copy_season_start := make_date(copy_from_year, 6, 1);
    END IF;
    
    -- Get the first week number for 2025 season
    SELECT MIN(week_number) INTO first_week_number_2025
    FROM public.weekly_prices 
    WHERE year = copy_from_year 
    LIMIT 1;
  END IF;

  -- Loop through each apartment (convert integer ID to text)
  FOR apartment_record IN SELECT id::text as apartment_id FROM public.apartments LOOP
    current_week_start := season_start;
    week_counter := 1;
    
    -- Map apartment ID for lookup in 2025 data
    source_apartment_id := 'appartamento-' || apartment_record.apartment_id;
    
    -- Generate weekly prices for the season
    WHILE current_week_start <= season_end LOOP
      DECLARE
        week_end_date DATE;
        price_to_use NUMERIC;
        source_week_number INTEGER;
      BEGIN
        -- Calculate week end (or season end if shorter)
        week_end_date := LEAST(current_week_start + INTERVAL '6 days', season_end);
        
        -- Determine price to use
        IF copy_from_year IS NOT NULL AND first_week_number_2025 IS NOT NULL THEN
          -- Calculate the corresponding week number in 2025
          source_week_number := first_week_number_2025 + week_counter - 1;
          
          -- Try to copy from previous year using mapped apartment ID and calculated week number
          SELECT price INTO price_to_use
          FROM public.weekly_prices 
          WHERE apartment_id = source_apartment_id 
            AND year = copy_from_year 
            AND week_number = source_week_number
          LIMIT 1;
        END IF;
        
        -- If no price found, use base price with some variation
        IF price_to_use IS NULL THEN
          -- Create price variation based on week (higher in peak summer)
          CASE 
            WHEN week_counter <= 4 THEN price_to_use := base_price; -- Early season
            WHEN week_counter <= 8 THEN price_to_use := base_price * 1.2; -- Mid season
            WHEN week_counter <= 12 THEN price_to_use := base_price * 1.5; -- Peak season
            WHEN week_counter <= 16 THEN price_to_use := base_price * 1.3; -- Late peak
            ELSE price_to_use := base_price * 1.1; -- End season
          END CASE;
        END IF;

        -- Insert the weekly price
        INSERT INTO public.weekly_prices (
          apartment_id, 
          year, 
          week_start, 
          week_end, 
          week_number, 
          price
        ) VALUES (
          apartment_record.apartment_id,
          target_year,
          current_week_start,
          week_end_date,
          week_counter,
          price_to_use
        ) ON CONFLICT (apartment_id, year, week_number) DO UPDATE SET
          week_start = EXCLUDED.week_start,
          week_end = EXCLUDED.week_end,
          price = EXCLUDED.price,
          updated_at = now();
        
        weeks_created := weeks_created + 1;
        week_counter := week_counter + 1;
        current_week_start := current_week_start + INTERVAL '7 days';
      END;
    END LOOP;
  END LOOP;

  RETURN weeks_created;
END;
$function$;

-- Fix other database functions with secure search paths
CREATE OR REPLACE FUNCTION public.generate_saturday_weeks_for_year(target_year integer, copy_from_year integer DEFAULT NULL::integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  apartment_record RECORD;
  season_start DATE;
  season_end DATE;
  current_week_start DATE;
  week_counter INTEGER := 1;
  weeks_created INTEGER := 0;
  price_to_use NUMERIC;
  first_saturday DATE;
BEGIN
  -- Get season dates for target year
  SELECT 
    make_date(target_year, season_start_month, season_start_day),
    make_date(target_year, season_end_month, season_end_day)
  INTO season_start, season_end
  FROM public.season_config 
  WHERE year = target_year AND is_active = true
  LIMIT 1;

  -- If no config found, use defaults
  IF season_start IS NULL THEN
    season_start := make_date(target_year, 6, 6); -- First Friday of June approximation
    season_end := make_date(target_year, 10, 5);   -- First Sunday of October approximation
  END IF;

  -- Find the first Saturday on or before season start
  -- DOW: Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6
  first_saturday := season_start - EXTRACT(DOW FROM season_start)::integer + 6;
  
  -- If the calculation gives us a date after season_start, go back one week
  IF first_saturday > season_start THEN
    first_saturday := first_saturday - 7;
  END IF;

  -- Loop through each apartment
  FOR apartment_record IN SELECT 'appartamento-' || id::text as apartment_id FROM public.apartments LOOP
    current_week_start := first_saturday;
    week_counter := 1;
    
    -- Generate weekly prices for the season (Saturday to Friday)
    WHILE current_week_start <= season_end LOOP
      DECLARE
        week_end_date DATE;
      BEGIN
        -- Calculate week end (Friday, 6 days later)
        week_end_date := current_week_start + INTERVAL '6 days';
        
        -- Get price from copy year if specified
        IF copy_from_year IS NOT NULL THEN
          SELECT price INTO price_to_use
          FROM public.weekly_prices 
          WHERE apartment_id = apartment_record.apartment_id 
            AND year = copy_from_year 
            AND week_number = week_counter
          LIMIT 1;
        END IF;
        
        -- If no price found, use base price with variation
        IF price_to_use IS NULL THEN
          CASE 
            WHEN week_counter <= 4 THEN price_to_use := 400; -- Early season
            WHEN week_counter <= 8 THEN price_to_use := 475; -- Mid season
            WHEN week_counter <= 12 THEN price_to_use := 750; -- Peak season
            WHEN week_counter <= 16 THEN price_to_use := 600; -- Late peak
            ELSE price_to_use := 450; -- End season
          END CASE;
        END IF;

        -- Insert the weekly price
        INSERT INTO public.weekly_prices (
          apartment_id, 
          year, 
          week_start, 
          week_end, 
          week_number, 
          price
        ) VALUES (
          apartment_record.apartment_id,
          target_year,
          current_week_start,
          week_end_date,
          week_counter,
          price_to_use
        );
        
        weeks_created := weeks_created + 1;
        week_counter := week_counter + 1;
        current_week_start := current_week_start + INTERVAL '7 days';
        
        -- Reset price for next iteration
        price_to_use := NULL;
      END;
    END LOOP;
  END LOOP;

  RETURN weeks_created;
END;
$function$;

-- Create admin profiles table for proper auth
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for admin_profiles
CREATE POLICY "Admin profiles are viewable by authenticated users"
  ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin profiles can be updated by owners"
  ON public.admin_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin profiles can be inserted by users"
  ON public.admin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for admin profile creation
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_profiles (user_id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE admin_profiles.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Update admin_users RLS policies to use proper auth
DROP POLICY IF EXISTS "Only authenticated admins can access" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.admin_notifications;

-- More secure admin policies
CREATE POLICY "Only authenticated admins can manage admin_users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only authenticated admins can manage notifications"
  ON public.admin_notifications
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Update reservations policies for better security
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can insert reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON public.reservations;

CREATE POLICY "Only authenticated admins can manage reservations"
  ON public.reservations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());