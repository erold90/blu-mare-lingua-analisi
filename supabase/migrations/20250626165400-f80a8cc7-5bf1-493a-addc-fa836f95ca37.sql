
-- 1. ELIMINAZIONE COMPLETA del sistema analytics esistente
DROP VIEW IF EXISTS public.site_visits_stats CASCADE;
DROP TABLE IF EXISTS public.site_visits CASCADE;
DROP TABLE IF EXISTS public.quote_logs CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_site_visits() CASCADE;
DROP FUNCTION IF EXISTS public.get_optimized_visit_counts() CASCADE;

-- 2. RICREAZIONE tabelle analytics ottimizzate

-- Tabella visite sito - struttura pulita e ottimizzata
CREATE TABLE public.site_visits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella preventivi - struttura semplificata
CREATE TABLE public.quote_logs (
  id TEXT PRIMARY KEY,
  form_data JSONB NOT NULL,
  step INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  total_price NUMERIC,
  user_session TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. INDICI per performance ottimali
CREATE INDEX idx_site_visits_created_at ON public.site_visits(created_at);
CREATE INDEX idx_site_visits_page ON public.site_visits(page);
CREATE INDEX idx_site_visits_session ON public.site_visits(session_id);
CREATE INDEX idx_quote_logs_created_at ON public.quote_logs(created_at);
CREATE INDEX idx_quote_logs_completed ON public.quote_logs(completed);
CREATE INDEX idx_quote_logs_session ON public.quote_logs(user_session);

-- 4. VISTA analytics ottimizzata
CREATE VIEW public.analytics_summary AS
SELECT 
  DATE(created_at) as visit_date,
  page,
  COUNT(*) as visit_count,
  COUNT(DISTINCT session_id) as unique_sessions
FROM public.site_visits
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at), page
ORDER BY visit_date DESC, visit_count DESC;

-- 5. FUNZIONE per conteggi rapidi (query singola ottimizzata)
CREATE OR REPLACE FUNCTION public.get_analytics_counts()
RETURNS TABLE(
  visits_today BIGINT,
  visits_week BIGINT,
  visits_month BIGINT,
  quotes_today BIGINT,
  quotes_completed BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.site_visits WHERE created_at >= CURRENT_DATE),
    (SELECT COUNT(*) FROM public.site_visits WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    (SELECT COUNT(*) FROM public.site_visits WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    (SELECT COUNT(*) FROM public.quote_logs WHERE created_at >= CURRENT_DATE),
    (SELECT COUNT(*) FROM public.quote_logs WHERE completed = true)
$$;

-- 6. FUNZIONE per pulizia automatica
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
RETURNS TABLE(deleted_visits BIGINT, deleted_quotes BIGINT) 
LANGUAGE plpgsql
AS $$
DECLARE
  visits_deleted BIGINT;
  quotes_deleted BIGINT;
BEGIN
  -- Elimina visite più vecchie di 6 mesi
  DELETE FROM public.site_visits 
  WHERE created_at < NOW() - INTERVAL '6 months';
  GET DIAGNOSTICS visits_deleted = ROW_COUNT;
  
  -- Elimina quote incomplete più vecchie di 3 mesi
  DELETE FROM public.quote_logs 
  WHERE created_at < NOW() - INTERVAL '3 months' AND completed = false;
  GET DIAGNOSTICS quotes_deleted = ROW_COUNT;
  
  RETURN QUERY SELECT visits_deleted, quotes_deleted;
END;
$$;

-- 7. RLS POLICIES - Accesso pubblico controllato
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_logs ENABLE ROW LEVEL SECURITY;

-- Policy per site_visits
CREATE POLICY "Public can insert site visits" ON public.site_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read site visits" ON public.site_visits FOR SELECT USING (true);
CREATE POLICY "Admin can delete old visits" ON public.site_visits FOR DELETE USING (true);

-- Policy per quote_logs  
CREATE POLICY "Public can manage quotes" ON public.quote_logs FOR ALL USING (true) WITH CHECK (true);

-- 8. TRIGGER per updated_at automatico
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_logs_updated_at
  BEFORE UPDATE ON public.quote_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
