
-- 1. Prima identifica e pulisci i dati orfani
DELETE FROM public.cleaning_tasks 
WHERE apartment_id NOT IN (SELECT id FROM public.apartments);

-- 2. Ora aggiungi tutti i constraint e configurazioni
-- Rimuovi eventuali enum già creati
DROP TYPE IF EXISTS cleaning_task_type CASCADE;
DROP TYPE IF EXISTS cleaning_status CASCADE;
DROP TYPE IF EXISTS cleaning_priority CASCADE;

-- Aggiungi constraint CHECK per validare i valori
ALTER TABLE public.cleaning_tasks 
  ADD CONSTRAINT check_task_type 
  CHECK (task_type IN ('checkout', 'maintenance', 'deep_clean', 'inspection'));

ALTER TABLE public.cleaning_tasks 
  ADD CONSTRAINT check_status 
  CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE public.cleaning_tasks 
  ADD CONSTRAINT check_priority 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Aggiorna i valori esistenti per assicurarci che siano validi
UPDATE public.cleaning_tasks 
SET task_type = 'checkout' 
WHERE task_type NOT IN ('checkout', 'maintenance', 'deep_clean', 'inspection');

UPDATE public.cleaning_tasks 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'in_progress', 'completed', 'cancelled');

UPDATE public.cleaning_tasks 
SET priority = 'medium' 
WHERE priority NOT IN ('low', 'medium', 'high', 'urgent');

-- Imposta i default
ALTER TABLE public.cleaning_tasks 
  ALTER COLUMN task_type SET DEFAULT 'checkout',
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN priority SET DEFAULT 'medium';

-- Aggiungi constraint per apartment_id (ora che i dati sono puliti)
ALTER TABLE public.cleaning_tasks 
  ADD CONSTRAINT fk_cleaning_tasks_apartment 
  FOREIGN KEY (apartment_id) REFERENCES public.apartments(id) ON DELETE CASCADE;

-- Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_apartment_date ON public.cleaning_tasks(apartment_id, task_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_status ON public.cleaning_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_assignee ON public.cleaning_tasks(assignee);

-- Riabilita RLS
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;

-- Crea policy per accesso completo
DROP POLICY IF EXISTS "Allow all operations on cleaning_tasks" ON public.cleaning_tasks;
CREATE POLICY "Allow all operations on cleaning_tasks" 
  ON public.cleaning_tasks 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Aggiungi trigger per updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_cleaning_tasks_updated_at'
  ) THEN
    CREATE TRIGGER update_cleaning_tasks_updated_at
      BEFORE UPDATE ON public.cleaning_tasks
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
