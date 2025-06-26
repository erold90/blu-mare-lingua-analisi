
-- Ottimizzazione della tabella site_visits
-- 1. Rimuovi il campo timestamp ridondante e usa solo created_at
ALTER TABLE site_visits DROP COLUMN IF EXISTS timestamp;

-- 2. Aggiungi indici per ottimizzare le query temporali
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_site_visits_page ON site_visits(page);
CREATE INDEX IF NOT EXISTS idx_site_visits_page_date ON site_visits(page, created_at);

-- 3. Aggiungi funzione per pulizia automatica dei dati vecchi
CREATE OR REPLACE FUNCTION cleanup_old_site_visits()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Elimina visite più vecchie di 90 giorni
  DELETE FROM site_visits 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log dell'operazione
  RAISE NOTICE 'Cleaned up old site visits older than 90 days';
END;
$$;

-- 4. Crea una vista per statistiche ottimizzate
CREATE OR REPLACE VIEW site_visits_stats AS
SELECT 
  DATE(created_at) as visit_date,
  page,
  COUNT(*) as visit_count
FROM site_visits
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), page
ORDER BY visit_date DESC, visit_count DESC;

-- 5. Ottimizza la tabella quote_logs con indici
CREATE INDEX IF NOT EXISTS idx_quote_logs_created_at ON quote_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_quote_logs_completed ON quote_logs(completed);
CREATE INDEX IF NOT EXISTS idx_quote_logs_step ON quote_logs(step);
