-- Remove all weekly prices from the first Sunday of October onwards for all years
-- This effectively ends the season before the first Sunday of October

-- Calculate the first Sunday of October for each year and delete prices from that date onwards
WITH first_sundays AS (
  SELECT DISTINCT year,
    -- Calculate first Sunday of October
    -- If Oct 1st is Sunday (dow=0), it's the first Sunday
    -- Otherwise, add days to reach the next Sunday
    MAKE_DATE(year, 10, 1) + ((7 - EXTRACT(dow FROM MAKE_DATE(year, 10, 1))::int) % 7)::int AS first_sunday_october
  FROM weekly_prices
)
DELETE FROM weekly_prices 
WHERE EXISTS (
  SELECT 1 FROM first_sundays 
  WHERE first_sundays.year = weekly_prices.year 
    AND weekly_prices.week_start >= first_sundays.first_sunday_october
);