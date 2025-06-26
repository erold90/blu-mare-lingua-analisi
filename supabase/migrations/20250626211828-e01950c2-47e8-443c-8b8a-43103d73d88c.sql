
-- Rimuovi la vista esistente con SECURITY DEFINER
DROP VIEW IF EXISTS public.analytics_summary;

-- Ricrea la vista senza SECURITY DEFINER (usa SECURITY INVOKER per default)
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
