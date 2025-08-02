-- Fix the data type conversion issue in generate_weekly_prices_for_year function
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
  current_week_start DATE;
  week_counter INTEGER := 1;
  weeks_created INTEGER := 0;
  base_price NUMERIC := 100; -- Default base price
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

  -- Loop through each apartment (convert integer ID to text)
  FOR apartment_record IN SELECT id::text as apartment_id FROM public.apartments LOOP
    current_week_start := season_start;
    week_counter := 1;
    
    -- Generate weekly prices for the season
    WHILE current_week_start <= season_end LOOP
      DECLARE
        week_end_date DATE;
        price_to_use NUMERIC;
      BEGIN
        -- Calculate week end (or season end if shorter)
        week_end_date := LEAST(current_week_start + INTERVAL '6 days', season_end);
        
        -- Determine price to use
        IF copy_from_year IS NOT NULL THEN
          -- Try to copy from previous year (apartment_id is text)
          SELECT price INTO price_to_use
          FROM public.weekly_prices 
          WHERE apartment_id = apartment_record.apartment_id 
            AND year = copy_from_year 
            AND week_number = week_counter
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