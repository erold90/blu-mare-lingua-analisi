
-- Tabella per le sessioni dei visitatori
CREATE TABLE public.visitor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  visitor_ip TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  operating_system TEXT,
  screen_resolution TEXT,
  language TEXT,
  timezone TEXT,
  country TEXT,
  city TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  first_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_views_count INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 0,
  is_bounce BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per le visualizzazioni dettagliate delle pagine
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.visitor_sessions(session_id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_title TEXT,
  time_on_page INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  exit_page BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per le interazioni specifiche
CREATE TABLE public.visitor_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.visitor_sessions(session_id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'click', 'form_submit', 'download', 'quote_request'
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  page_url TEXT NOT NULL,
  additional_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per analytics aggregati giornalieri
CREATE TABLE public.daily_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  unique_visitors INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  avg_session_duration NUMERIC(10,2) DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  top_pages JSONB DEFAULT '[]'::jsonb,
  top_referrers JSONB DEFAULT '[]'::jsonb,
  device_breakdown JSONB DEFAULT '{}'::jsonb,
  country_breakdown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indici per performance
CREATE INDEX idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);
CREATE INDEX idx_visitor_sessions_first_visit ON public.visitor_sessions(first_visit);
CREATE INDEX idx_visitor_sessions_country ON public.visitor_sessions(country);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_timestamp ON public.page_views(timestamp);
CREATE INDEX idx_page_views_page_url ON public.page_views(page_url);
CREATE INDEX idx_visitor_interactions_session_id ON public.visitor_interactions(session_id);
CREATE INDEX idx_visitor_interactions_type ON public.visitor_interactions(interaction_type);
CREATE INDEX idx_visitor_interactions_timestamp ON public.visitor_interactions(timestamp);
CREATE INDEX idx_daily_analytics_date ON public.daily_analytics(date);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_daily_analytics_updated_at
    BEFORE UPDATE ON public.daily_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Funzione per aggregare dati giornalieri
CREATE OR REPLACE FUNCTION public.aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    unique_visitors_count INTEGER;
    total_pageviews_count INTEGER;
    avg_duration NUMERIC(10,2);
    bounce_rate_calc NUMERIC(5,2);
    top_pages_data JSONB;
    top_referrers_data JSONB;
    device_data JSONB;
    country_data JSONB;
BEGIN
    -- Calcola visitatori unici
    SELECT COUNT(DISTINCT session_id) INTO unique_visitors_count
    FROM public.visitor_sessions 
    WHERE DATE(first_visit) = target_date;
    
    -- Calcola totale pageviews
    SELECT COUNT(*) INTO total_pageviews_count
    FROM public.page_views 
    WHERE DATE(timestamp) = target_date;
    
    -- Calcola durata media sessione
    SELECT COALESCE(AVG(session_duration), 0) INTO avg_duration
    FROM public.visitor_sessions 
    WHERE DATE(first_visit) = target_date;
    
    -- Calcola bounce rate
    SELECT COALESCE(
        (COUNT(*) FILTER (WHERE is_bounce = true) * 100.0) / NULLIF(COUNT(*), 0), 
        0
    ) INTO bounce_rate_calc
    FROM public.visitor_sessions 
    WHERE DATE(first_visit) = target_date;
    
    -- Top 10 pagine
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object('page', page_url, 'views', views_count)
            ORDER BY views_count DESC
        ), 
        '[]'::jsonb
    ) INTO top_pages_data
    FROM (
        SELECT page_url, COUNT(*) as views_count
        FROM public.page_views 
        WHERE DATE(timestamp) = target_date
        GROUP BY page_url
        ORDER BY views_count DESC
        LIMIT 10
    ) top_pages;
    
    -- Top 10 referrer
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object('referrer', referrer, 'visits', visits_count)
            ORDER BY visits_count DESC
        ), 
        '[]'::jsonb
    ) INTO top_referrers_data
    FROM (
        SELECT 
            COALESCE(NULLIF(referrer, ''), 'Direct') as referrer, 
            COUNT(*) as visits_count
        FROM public.visitor_sessions 
        WHERE DATE(first_visit) = target_date
        GROUP BY referrer
        ORDER BY visits_count DESC
        LIMIT 10
    ) top_refs;
    
    -- Breakdown dispositivi
    SELECT COALESCE(
        jsonb_object_agg(device_type, device_count), 
        '{}'::jsonb
    ) INTO device_data
    FROM (
        SELECT 
            COALESCE(device_type, 'Unknown') as device_type, 
            COUNT(*) as device_count
        FROM public.visitor_sessions 
        WHERE DATE(first_visit) = target_date
        GROUP BY device_type
    ) devices;
    
    -- Breakdown paesi
    SELECT COALESCE(
        jsonb_object_agg(country, country_count), 
        '{}'::jsonb
    ) INTO country_data
    FROM (
        SELECT 
            COALESCE(country, 'Unknown') as country, 
            COUNT(*) as country_count
        FROM public.visitor_sessions 
        WHERE DATE(first_visit) = target_date
        GROUP BY country
    ) countries;
    
    -- Inserisci o aggiorna i dati aggregati
    INSERT INTO public.daily_analytics (
        date, unique_visitors, total_page_views, avg_session_duration,
        bounce_rate, top_pages, top_referrers, device_breakdown, country_breakdown
    ) VALUES (
        target_date, unique_visitors_count, total_pageviews_count, avg_duration,
        bounce_rate_calc, top_pages_data, top_referrers_data, device_data, country_data
    )
    ON CONFLICT (date) DO UPDATE SET
        unique_visitors = EXCLUDED.unique_visitors,
        total_page_views = EXCLUDED.total_page_views,
        avg_session_duration = EXCLUDED.avg_session_duration,
        bounce_rate = EXCLUDED.bounce_rate,
        top_pages = EXCLUDED.top_pages,
        top_referrers = EXCLUDED.top_referrers,
        device_breakdown = EXCLUDED.device_breakdown,
        country_breakdown = EXCLUDED.country_breakdown,
        updated_at = now();
END;
$$;
