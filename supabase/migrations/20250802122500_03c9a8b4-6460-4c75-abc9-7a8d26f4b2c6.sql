-- Rigenera i prezzi per il 2026 copiando correttamente dal 2025
DELETE FROM weekly_prices WHERE year = 2026;

-- Usa la funzione corretta per copiare i prezzi specifici per appartamento
SELECT generate_apartment_specific_weeks(2026, 2025);