
-- Step 2: Aggiungere RLS Policies di base per la sicurezza

-- 1. RESERVATIONS TABLE - Solo accesso pubblico controllato (nessuna autenticazione richiesta per ora)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reservations" 
  ON public.reservations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert for reservations" 
  ON public.reservations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update for reservations" 
  ON public.reservations 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete for reservations" 
  ON public.reservations 
  FOR DELETE 
  USING (true);

-- 2. CLEANING TASKS - Solo accesso pubblico per gestione admin
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to cleaning_tasks" 
  ON public.cleaning_tasks 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 3. PRICES - Solo lettura pubblica, scrittura controllata
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to prices" 
  ON public.prices 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public write access to prices" 
  ON public.prices 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update to prices" 
  ON public.prices 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete to prices" 
  ON public.prices 
  FOR DELETE 
  USING (true);

-- 4. APARTMENTS - Solo lettura pubblica
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to apartments" 
  ON public.apartments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public write access to apartments" 
  ON public.apartments 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 5. ANALYTICS TABLES - Accesso pubblico per il tracking
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to visitor_sessions" 
  ON public.visitor_sessions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to page_views" 
  ON public.page_views 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

ALTER TABLE public.visitor_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to visitor_interactions" 
  ON public.visitor_interactions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to daily_analytics" 
  ON public.daily_analytics 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 6. QUOTE LOGS - Accesso pubblico per il tracking preventivi
ALTER TABLE public.quote_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to quote_logs" 
  ON public.quote_logs 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 7. SITE VISITS - Accesso pubblico per analytics
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to site_visits" 
  ON public.site_visits 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 8. IMAGES - Solo lettura pubblica
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to images" 
  ON public.images 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public write access to images" 
  ON public.images 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
