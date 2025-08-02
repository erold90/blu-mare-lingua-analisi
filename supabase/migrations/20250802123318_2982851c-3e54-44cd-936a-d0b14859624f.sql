-- Correggo la funzione di mapping per date con casting corretto
DROP FUNCTION IF EXISTS public.generate_weekly_prices_by_date_mapping(integer, integer);

CREATE OR REPLACE FUNCTION public.generate_weekly_prices_by_date_mapping(target_year integer, copy_from_year integer DEFAULT NULL::integer)
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
  copy_from_date DATE;
  copy_from_week RECORD;
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
    season_start := make_date(target_year, 6, 6);
    season_end := make_date(target_year, 10, 5);
  END IF;

  -- Find the first Saturday on or before season start
  first_saturday := season_start - EXTRACT(DOW FROM season_start)::integer + 6;
  
  IF first_saturday > season_start THEN
    first_saturday := first_saturday - 7;
  END IF;

  -- Delete existing data for target year
  DELETE FROM public.weekly_prices WHERE year = target_year;

  -- Loop through each apartment
  FOR apartment_record IN SELECT 'appartamento-' || id::text as apartment_id FROM public.apartments LOOP
    current_week_start := first_saturday;
    week_counter := 1;
    
    -- Generate weekly prices for the season (Saturday to Friday)
    WHILE current_week_start <= season_end LOOP
      DECLARE
        week_end_date DATE;
      BEGIN
        week_end_date := current_week_start + INTERVAL '6 days';
        price_to_use := NULL;
        
        -- Map by actual date instead of week number
        IF copy_from_year IS NOT NULL THEN
          -- Calculate corresponding date in copy_from_year
          -- Same month and day, different year
          copy_from_date := make_date(copy_from_year, 
                                     EXTRACT(MONTH FROM current_week_start)::integer, 
                                     EXTRACT(DAY FROM current_week_start)::integer);
          
          -- Find the closest week in copy_from_year by week_start date
          SELECT * INTO copy_from_week
          FROM public.weekly_prices 
          WHERE apartment_id = apartment_record.apartment_id  
            AND year = copy_from_year 
            AND week_start <= copy_from_date
            AND week_end >= copy_from_date
          LIMIT 1;
          
          -- If exact match not found, try closest week by date difference
          IF copy_from_week.price IS NULL THEN
            SELECT * INTO copy_from_week
            FROM public.weekly_prices 
            WHERE apartment_id = apartment_record.apartment_id  
              AND year = copy_from_year 
            ORDER BY ABS(EXTRACT(EPOCH FROM (week_start::timestamp - copy_from_date::timestamp)))
            LIMIT 1;
          END IF;
          
          price_to_use := copy_from_week.price;
        END IF;
        
        -- If no specific price found for this apartment, use defaults
        IF price_to_use IS NULL THEN
          CASE 
            WHEN week_counter <= 4 THEN price_to_use := 400;
            WHEN week_counter <= 8 THEN price_to_use := 475;
            WHEN week_counter <= 12 THEN price_to_use := 750;
            WHEN week_counter <= 16 THEN price_to_use := 600;
            ELSE price_to_use := 450;
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
      END;
    END LOOP;
  END LOOP;

  RETURN weeks_created;
END;
$function$;

-- Rigenera i prezzi 2026 usando il mapping corretto per date
SELECT public.generate_weekly_prices_by_date_mapping(2026, 2025) as weeks_generated;