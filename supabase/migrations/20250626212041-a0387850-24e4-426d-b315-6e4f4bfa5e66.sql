
-- Rimuovi la vista esistente
DROP VIEW IF EXISTS public.analytics_summary;

-- Ricrea la vista con SECURITY INVOKER esplicito
CREATE VIEW public.analytics_summary WITH (security_invoker = on) AS
SELECT 
  DATE(created_at) as visit_date,
  page,
  COUNT(*) as visit_count,
  COUNT(DISTINCT session_id) as unique_sessions
FROM public.site_visits
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at), page
ORDER BY visit_date DESC, visit_count DESC;
