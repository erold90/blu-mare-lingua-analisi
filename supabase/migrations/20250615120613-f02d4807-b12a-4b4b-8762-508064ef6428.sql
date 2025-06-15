
-- Disabilita temporaneamente RLS per permettere operazioni senza autenticazione
ALTER TABLE public.cleaning_tasks DISABLE ROW LEVEL SECURITY;

-- In alternativa, se vuoi mantenere RLS abilitato, puoi creare policy permissive:
-- ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all operations on cleaning_tasks" 
--   ON public.cleaning_tasks 
--   FOR ALL 
--   USING (true) 
--   WITH CHECK (true);
