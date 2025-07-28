-- Create table for weekly pricing management
CREATE TABLE public.weekly_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  week_number INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(apartment_id, year, week_number)
);

-- Create table for date blocks (unavailable periods)
CREATE TABLE public.date_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id TEXT, -- null means all apartments blocked
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  block_reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for seasonal configuration
CREATE TABLE public.season_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  season_start_month INTEGER NOT NULL DEFAULT 6, -- June
  season_start_day INTEGER NOT NULL DEFAULT 1,
  season_end_month INTEGER NOT NULL DEFAULT 10, -- October  
  season_end_day INTEGER NOT NULL DEFAULT 31,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weekly_prices
CREATE POLICY "Public can view weekly prices" ON public.weekly_prices
FOR SELECT USING (true);

CREATE POLICY "Admins can manage weekly prices" ON public.weekly_prices
FOR ALL USING (true);

-- Create RLS policies for date_blocks  
CREATE POLICY "Public can view date blocks" ON public.date_blocks
FOR SELECT USING (true);

CREATE POLICY "Admins can manage date blocks" ON public.date_blocks
FOR ALL USING (true);

-- Create RLS policies for season_config
CREATE POLICY "Public can view season config" ON public.season_config
FOR SELECT USING (true);

CREATE POLICY "Admins can manage season config" ON public.season_config
FOR ALL USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_weekly_prices_updated_at
  BEFORE UPDATE ON public.weekly_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_date_blocks_updated_at
  BEFORE UPDATE ON public.date_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_season_config_updated_at
  BEFORE UPDATE ON public.season_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default season config for current and next years
INSERT INTO public.season_config (year) VALUES 
(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1);

-- Create function to generate weekly prices for a year
CREATE OR REPLACE FUNCTION public.generate_weekly_prices_for_year(
  target_year INTEGER,
  copy_from_year INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
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

  -- Loop through each apartment
  FOR apartment_record IN SELECT id FROM public.apartments LOOP
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
          -- Try to copy from previous year
          SELECT price INTO price_to_use
          FROM public.weekly_prices 
          WHERE apartment_id = apartment_record.id 
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
          apartment_record.id,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate initial prices for current and next year
SELECT public.generate_weekly_prices_for_year(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
SELECT public.generate_weekly_prices_for_year(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1);