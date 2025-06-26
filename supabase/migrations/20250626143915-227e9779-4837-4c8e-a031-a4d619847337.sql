
-- Verifica se la tabella site_visits esiste e ha la struttura corretta
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'site_visits' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verifica se ci sono record nella tabella
SELECT COUNT(*) as total_records FROM site_visits;

-- Verifica gli ultimi 10 record per debug
SELECT id, page, timestamp, created_at 
FROM site_visits 
ORDER BY created_at DESC 
LIMIT 10;

-- Verifica se ci sono problemi di performance con indici
SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'site_visits';

-- Crea indice per migliorare le performance se non esiste
CREATE INDEX IF NOT EXISTS idx_site_visits_timestamp ON site_visits(timestamp);
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at);
