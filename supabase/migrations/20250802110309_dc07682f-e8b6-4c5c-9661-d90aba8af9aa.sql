-- Remove duplicate weekly prices for 2026 with incorrect apartment_id format
-- Keep only the records with numeric apartment_id (1,2,3,4) which have the correct copied prices

DELETE FROM weekly_prices 
WHERE year = 2026 
  AND apartment_id LIKE 'appartamento-%';