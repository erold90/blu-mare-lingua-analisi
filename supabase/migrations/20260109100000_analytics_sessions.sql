-- =====================================================
-- NUOVO SISTEMA ANALYTICS - Tabelle Sessioni e Funnel
-- =====================================================

-- 1. Tabella analytics_sessions: traccia le sessioni utente
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,

  -- Timestamp
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),

  -- Device info (parsed da user agent)
  device_type TEXT,                      -- mobile/tablet/desktop
  browser TEXT,                          -- Chrome/Safari/Firefox/Edge
  browser_version TEXT,
  os TEXT,                               -- iOS/Android/Windows/macOS/Linux
  os_version TEXT,

  -- Geolocalizzazione
  country TEXT,
  country_code TEXT,
  city TEXT,
  region TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  -- Source tracking
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  landing_page TEXT,

  -- Engagement metrics
  pages_viewed INTEGER DEFAULT 0,
  time_on_site INTEGER DEFAULT 0,        -- secondi totali

  -- Conversion tracking
  opened_quote_form BOOLEAN DEFAULT false,
  reached_step INTEGER DEFAULT 0,        -- ultimo step raggiunto (1-6)
  completed_quote BOOLEAN DEFAULT false,
  sent_whatsapp BOOLEAN DEFAULT false,

  -- Return visitor tracking
  is_returning BOOLEAN DEFAULT false,
  previous_sessions INTEGER DEFAULT 0,
  visitor_id TEXT,                       -- ID persistente tra sessioni

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabella quote_funnel_events: traccia ogni step del funnel
CREATE TABLE IF NOT EXISTS public.quote_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,

  -- Evento
  event_type TEXT NOT NULL,              -- form_opened, step_1, step_2, etc.
  event_data JSONB,                      -- dati specifici dell'evento

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Collegamento al preventivo (se completato)
  quote_id INTEGER REFERENCES public.quote_requests(id) ON DELETE SET NULL
);

-- 3. Aggiungere session_id alle tabelle esistenti

-- Aggiungere session_id a website_visits se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_visits' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE public.website_visits ADD COLUMN session_id TEXT;
  END IF;
END $$;

-- Aggiungere session_id a quote_requests se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE public.quote_requests ADD COLUMN session_id TEXT;
  END IF;
END $$;

-- 4. Indici per performance
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON public.analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_first_visit ON public.analytics_sessions(first_visit);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_country ON public.analytics_sessions(country);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_device ON public.analytics_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON public.analytics_sessions(visitor_id);

CREATE INDEX IF NOT EXISTS idx_quote_funnel_session ON public.quote_funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_quote_funnel_event_type ON public.quote_funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_quote_funnel_created ON public.quote_funnel_events(created_at);

CREATE INDEX IF NOT EXISTS idx_website_visits_session ON public.website_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_session ON public.quote_requests(session_id);

-- 5. RLS Policies

-- Analytics sessions: pubblico può inserire, solo admin può leggere
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on analytics_sessions" ON public.analytics_sessions;
CREATE POLICY "Allow public insert on analytics_sessions"
  ON public.analytics_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on analytics_sessions" ON public.analytics_sessions;
CREATE POLICY "Allow public update on analytics_sessions"
  ON public.analytics_sessions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read on analytics_sessions" ON public.analytics_sessions;
CREATE POLICY "Allow authenticated read on analytics_sessions"
  ON public.analytics_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Quote funnel events: pubblico può inserire, solo admin può leggere
ALTER TABLE public.quote_funnel_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on quote_funnel_events" ON public.quote_funnel_events;
CREATE POLICY "Allow public insert on quote_funnel_events"
  ON public.quote_funnel_events
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read on quote_funnel_events" ON public.quote_funnel_events;
CREATE POLICY "Allow authenticated read on quote_funnel_events"
  ON public.quote_funnel_events
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. Funzione per aggiornare last_activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_session_activity ON public.analytics_sessions;
CREATE TRIGGER trigger_update_session_activity
  BEFORE UPDATE ON public.analytics_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- 7. Vista aggregata per funnel analytics
CREATE OR REPLACE VIEW public.funnel_analytics AS
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT CASE WHEN event_type = 'form_opened' THEN session_id END) as form_opened,
  COUNT(DISTINCT CASE WHEN event_type = 'step_1_dates' THEN session_id END) as step_1,
  COUNT(DISTINCT CASE WHEN event_type = 'step_2_guests' THEN session_id END) as step_2,
  COUNT(DISTINCT CASE WHEN event_type = 'step_3_apartments' THEN session_id END) as step_3,
  COUNT(DISTINCT CASE WHEN event_type = 'step_4_services' THEN session_id END) as step_4,
  COUNT(DISTINCT CASE WHEN event_type = 'step_5_summary' THEN session_id END) as step_5,
  COUNT(DISTINCT CASE WHEN event_type = 'quote_created' THEN session_id END) as quote_created,
  COUNT(DISTINCT CASE WHEN event_type = 'whatsapp_clicked' THEN session_id END) as whatsapp_clicked
FROM public.quote_funnel_events
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Grant permissions per la vista
GRANT SELECT ON public.funnel_analytics TO authenticated;
