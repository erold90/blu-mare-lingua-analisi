-- Fix weekly periods to be Saturday to Friday for years 2026-2035
-- Delete existing incorrect weekly data for these years
DELETE FROM weekly_prices WHERE year BETWEEN 2026 AND 2035;

-- Create a corrected function to generate Saturday-to-Friday weeks
CREATE OR REPLACE FUNCTION generate_saturday_weeks_for_year(target_year integer, copy_from_year integer DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
AS $$
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
$$;

-- Generate Saturday-to-Friday weeks for all years 2026-2035
SELECT generate_saturday_weeks_for_year(2026, 2025);
SELECT generate_saturday_weeks_for_year(2027, 2025);
SELECT generate_saturday_weeks_for_year(2028, 2025);
SELECT generate_saturday_weeks_for_year(2029, 2025);
SELECT generate_saturday_weeks_for_year(2030, 2025);
SELECT generate_saturday_weeks_for_year(2031, 2025);
SELECT generate_saturday_weeks_for_year(2032, 2025);
SELECT generate_saturday_weeks_for_year(2033, 2025);
SELECT generate_saturday_weeks_for_year(2034, 2025);
SELECT generate_saturday_weeks_for_year(2035, 2025);