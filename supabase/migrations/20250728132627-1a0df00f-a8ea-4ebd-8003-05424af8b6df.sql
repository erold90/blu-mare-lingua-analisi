-- Abilita RLS su tutte le tabelle che ne hanno bisogno
-- Controlla le tabelle che dovrebbero avere RLS abilitato

-- Abilita RLS su reservations se non è già abilitato
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Abilita RLS su quote_logs se non è già abilitato
ALTER TABLE public.quote_logs ENABLE ROW LEVEL SECURITY;

-- Verifica lo stato di RLS su tutte le tabelle
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('reservations', 'quote_logs', 'prices', 'apartments', 'cleaning_tasks', 'images', 'user_profiles', 'user_roles', 'site_visits', 'notifications')
ORDER BY tablename;