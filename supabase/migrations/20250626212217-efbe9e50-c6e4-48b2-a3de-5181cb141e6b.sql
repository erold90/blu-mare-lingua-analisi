
-- Fix per get_analytics_counts
ALTER FUNCTION public.get_analytics_counts() SET search_path = public;

-- Fix per cleanup_old_analytics
ALTER FUNCTION public.cleanup_old_analytics() SET search_path = public;

-- Fix per update_updated_at
ALTER FUNCTION public.update_updated_at() SET search_path = public;

-- Fix per update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
