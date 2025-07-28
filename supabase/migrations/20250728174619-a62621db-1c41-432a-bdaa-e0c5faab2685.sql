-- Elimino tutte le tabelle relative all'area riservata e autenticazione
-- Mantengo solo quelle essenziali per il business (apartments, prices, reservations, images)

-- Elimino le tabelle di gestione utenti e autenticazione
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.cleaning_tasks CASCADE;
DROP TABLE IF EXISTS public.performance_metrics CASCADE;
DROP TABLE IF EXISTS public.analytics_summary CASCADE;
DROP TABLE IF EXISTS public.site_visits CASCADE;
DROP TABLE IF EXISTS public.quote_logs CASCADE;

-- Elimino le funzioni relative all'autenticazione
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_analytics_counts() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.login_with_username(text, text) CASCADE;

-- Elimino il tipo enum
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Elimino i trigger se esistono
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;