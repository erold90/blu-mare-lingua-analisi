
-- Correzione sistema analytics - Fix della funzione esistente

-- 1. Drop e ricrea la funzione cleanup con la firma corretta
DROP FUNCTION IF EXISTS public.cleanup_old_analytics();

CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
RETURNS TABLE(deleted_visits BIGINT, deleted_quotes BIGINT) 
LANGUAGE plpgsql
AS $$
DECLARE
  visits_deleted BIGINT := 0;
  quotes_deleted BIGINT := 0;
  visits_to_delete BIGINT;
  quotes_to_delete BIGINT;
BEGIN
  -- Conta prima di eliminare
  SELECT COUNT(*) INTO visits_to_delete 
  FROM public.site_visits 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  SELECT COUNT(*) INTO quotes_to_delete 
  FROM public.quote_logs 
  WHERE created_at < NOW() - INTERVAL '3 months' AND completed = false;
  
  -- Procedi solo se ci sono dati da eliminare
  IF visits_to_delete > 0 THEN
    DELETE FROM public.site_visits 
    WHERE created_at < NOW() - INTERVAL '6 months';
    GET DIAGNOSTICS visits_deleted = ROW_COUNT;
  END IF;
  
  IF quotes_to_delete > 0 THEN
    DELETE FROM public.quote_logs 
    WHERE created_at < NOW() - INTERVAL '3 months' AND completed = false;
    GET DIAGNOSTICS quotes_deleted = ROW_COUNT;
  END IF;
  
  RETURN QUERY SELECT visits_deleted, quotes_deleted;
END;
$$;

-- 2. Correzione RLS policies più sicure
DROP POLICY IF EXISTS "Public can insert site visits" ON public.site_visits;
DROP POLICY IF EXISTS "Public can read site visits" ON public.site_visits;
DROP POLICY IF EXISTS "Admin can delete old visits" ON public.site_visits;
DROP POLICY IF EXISTS "Public can manage quotes" ON public.quote_logs;

CREATE POLICY "Allow insert site visits" ON public.site_visits 
FOR INSERT WITH CHECK (
  page IS NOT NULL AND 
  LENGTH(page) > 0 AND 
  LENGTH(page) <= 500
);

CREATE POLICY "Allow select site visits" ON public.site_visits 
FOR SELECT USING (true);

CREATE POLICY "Allow insert quote logs" ON public.quote_logs 
FOR INSERT WITH CHECK (
  id IS NOT NULL AND 
  form_data IS NOT NULL AND 
  step >= 1 AND 
  step <= 10
);

CREATE POLICY "Allow select quote logs" ON public.quote_logs 
FOR SELECT USING (true);

CREATE POLICY "Allow update quote logs" ON public.quote_logs 
FOR UPDATE USING (id IS NOT NULL);

-- 3. Funzione per normalizzazione URL
CREATE OR REPLACE FUNCTION public.normalize_page_url(input_url TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE
    WHEN input_url ~ '\?.*lovable' THEN 
      SPLIT_PART(input_url, '?', 1)
    WHEN input_url ~ '/$' AND LENGTH(input_url) > 1 THEN 
      RTRIM(input_url, '/')
    WHEN LENGTH(input_url) > 500 THEN 
      LEFT(input_url, 500)
    ELSE 
      input_url
  END
$$;

-- 4. Trigger per normalizzazione URL
CREATE OR REPLACE FUNCTION public.normalize_site_visit_url()
RETURNS TRIGGER AS $$
BEGIN
  NEW.page := public.normalize_page_url(NEW.page);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS normalize_url_trigger ON public.site_visits;
CREATE TRIGGER normalize_url_trigger
  BEFORE INSERT ON public.site_visits
  FOR EACH ROW EXECUTE FUNCTION public.normalize_site_visit_url();
