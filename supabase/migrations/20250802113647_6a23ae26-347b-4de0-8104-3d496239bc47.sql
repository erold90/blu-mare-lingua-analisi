-- Update weekly_prices apartment_id from integer to string format to match the system
UPDATE weekly_prices 
SET apartment_id = CASE 
  WHEN apartment_id = '1' THEN 'appartamento-1'
  WHEN apartment_id = '2' THEN 'appartamento-2' 
  WHEN apartment_id = '3' THEN 'appartamento-3'
  WHEN apartment_id = '4' THEN 'appartamento-4'
  ELSE apartment_id
END
WHERE apartment_id IN ('1', '2', '3', '4');