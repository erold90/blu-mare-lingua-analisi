
-- Drop the existing problematic view
DROP VIEW IF EXISTS public.site_visits_stats;

-- Recreate the view with SECURITY INVOKER and the correct query
CREATE OR REPLACE VIEW public.site_visits_stats
WITH (security_invoker = on) AS
SELECT 
  DATE(created_at) as visit_date,
  page,
  COUNT(*) as visit_count
FROM site_visits
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), page
ORDER BY visit_date DESC, visit_count DESC;
