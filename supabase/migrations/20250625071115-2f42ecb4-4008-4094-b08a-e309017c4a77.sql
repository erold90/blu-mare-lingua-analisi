
-- Rimuovi le tabelle analytics avanzate non utilizzate
DROP TABLE IF EXISTS public.visitor_interactions CASCADE;
DROP TABLE IF EXISTS public.page_views CASCADE;
DROP TABLE IF EXISTS public.visitor_sessions CASCADE;
DROP TABLE IF EXISTS public.daily_analytics CASCADE;

-- Rimuovi la funzione di aggregazione non utilizzata
DROP FUNCTION IF EXISTS public.aggregate_daily_analytics(date);
