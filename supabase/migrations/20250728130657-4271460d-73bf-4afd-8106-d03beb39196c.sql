-- Disabilita temporaneamente RLS per reservations per permettere accesso con sistema di login locale
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- Disabilita temporaneamente RLS per quote_logs
ALTER TABLE public.quote_logs DISABLE ROW LEVEL SECURITY;