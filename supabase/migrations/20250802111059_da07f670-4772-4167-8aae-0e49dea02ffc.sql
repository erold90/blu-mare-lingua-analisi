-- Create date blocks from first Sunday of October to first Friday of June next year
-- for all years from 2025 to 2035

WITH date_ranges AS (
  SELECT 
    year_num,
    -- Calculate first Sunday of October
    -- If Oct 1st is Sunday (dow=0), it's Oct 1st
    -- Otherwise, add days to reach next Sunday
    MAKE_DATE(year_num, 10, 1) + ((7 - EXTRACT(dow FROM MAKE_DATE(year_num, 10, 1))::int) % 7)::int AS start_date,
    -- Calculate first Friday of June next year
    -- If June 1st is Friday (dow=5), it's June 1st
    -- Otherwise, add days to reach next Friday
    MAKE_DATE(year_num + 1, 6, 1) + 
      CASE 
        WHEN EXTRACT(dow FROM MAKE_DATE(year_num + 1, 6, 1))::int <= 5 
        THEN (5 - EXTRACT(dow FROM MAKE_DATE(year_num + 1, 6, 1))::int)
        ELSE (5 + 7 - EXTRACT(dow FROM MAKE_DATE(year_num + 1, 6, 1))::int)
      END AS end_date
  FROM generate_series(2025, 2035) AS year_num
)
INSERT INTO date_blocks (apartment_id, start_date, end_date, block_reason, is_active)
SELECT 
  NULL, -- NULL means all apartments
  start_date,
  end_date,
  'Chiusura stagionale - dalla prima domenica di ottobre al primo venerdì di giugno',
  true
FROM date_ranges;