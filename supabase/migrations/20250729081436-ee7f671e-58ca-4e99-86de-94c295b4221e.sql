-- Tabella per tracciare le visite del sito web
CREATE TABLE public.website_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.website_visits ENABLE ROW LEVEL SECURITY;

-- Policy per permettere a tutti di inserire visite (per tracking pubblico)
CREATE POLICY "Anyone can track visits" 
ON public.website_visits 
FOR INSERT 
WITH CHECK (true);

-- Policy per permettere agli admin di visualizzare le visite
CREATE POLICY "Admins can view visits" 
ON public.website_visits 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE admin_users.username = current_setting('app.current_user', true)
));

-- Indici per performance
CREATE INDEX idx_website_visits_date ON public.website_visits(visit_date);
CREATE INDEX idx_website_visits_country ON public.website_visits(country);
CREATE INDEX idx_website_visits_page ON public.website_visits(page);
CREATE INDEX idx_website_visits_time ON public.website_visits(visit_time);