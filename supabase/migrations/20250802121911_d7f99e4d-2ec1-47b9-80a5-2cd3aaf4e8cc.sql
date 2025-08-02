-- Rimuovi tutti i record con apartment_id numerico (1,2,3,4) per gli anni 2026-2035
-- Mantieni solo quelli con apartment_id nel formato stringa (appartamento-1, etc.)

DELETE FROM weekly_prices 
WHERE year BETWEEN 2026 AND 2035 
  AND apartment_id IN ('1', '2', '3', '4');