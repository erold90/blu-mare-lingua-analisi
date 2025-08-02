-- Remove all weekly prices that start in October or later for all years
-- This ensures no October weeks remain in any year

DELETE FROM weekly_prices 
WHERE EXTRACT(month FROM week_start) >= 10;