
-- Step 3 (Corretto): Aggiungere Foreign Keys e Constraints mancanti

-- 1. FOREIGN KEYS
-- Aggiungi foreign key per cleaning_tasks -> apartments
ALTER TABLE public.cleaning_tasks 
  ADD CONSTRAINT fk_cleaning_tasks_apartment 
  FOREIGN KEY (apartment_id) REFERENCES public.apartments(id) ON DELETE CASCADE;

-- 2. CONSTRAINTS DI VALIDAZIONE
-- Constraint per prezzi non negativi
ALTER TABLE public.prices 
  ADD CONSTRAINT check_price_positive 
  CHECK (price >= 0);

-- Constraint per date valide nelle prenotazioni
ALTER TABLE public.reservations 
  ADD CONSTRAINT check_reservation_dates 
  CHECK (start_date < end_date);

-- Constraint per capacità positive negli appartamenti
ALTER TABLE public.apartments 
  ADD CONSTRAINT check_capacity_positive 
  CHECK (capacity > 0);

-- Constraint per durata pulizie positive
ALTER TABLE public.cleaning_tasks 
  ADD CONSTRAINT check_estimated_duration_positive 
  CHECK (estimated_duration > 0);

ALTER TABLE public.cleaning_tasks 
  ADD CONSTRAINT check_actual_duration_positive 
  CHECK (actual_duration IS NULL OR actual_duration > 0);

-- 3. INDICI PER PERFORMANCE
-- Indice composto per prices (query più frequenti)
CREATE INDEX IF NOT EXISTS idx_prices_apartment_year_week 
  ON public.prices(apartment_id, year, week_start);

-- Indice per date prenotazioni (per availability check)
CREATE INDEX IF NOT EXISTS idx_reservations_dates 
  ON public.reservations(start_date, end_date);

-- Indice per apartment_ids JSONB in reservations
CREATE INDEX IF NOT EXISTS idx_reservations_apartment_ids 
  ON public.reservations USING GIN(apartment_ids);

-- Indici per analytics performance
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_timestamp 
  ON public.visitor_sessions(first_visit);

CREATE INDEX IF NOT EXISTS idx_page_views_timestamp 
  ON public.page_views(timestamp);

-- Indice per cleaning tasks per data
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_date_status 
  ON public.cleaning_tasks(task_date, status);

-- 4. CONSTRAINT UNICO PER PREZZI (evitare duplicati)
CREATE UNIQUE INDEX IF NOT EXISTS idx_prices_unique_apartment_week_year 
  ON public.prices(apartment_id, week_start, year);

-- 5. TRIGGER PER UPDATED_AT
-- Assicuriamoci che tutti i trigger per updated_at esistano
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per apartments
DROP TRIGGER IF EXISTS update_apartments_updated_at ON public.apartments;
CREATE TRIGGER update_apartments_updated_at
  BEFORE UPDATE ON public.apartments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger per reservations
DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger per prices
DROP TRIGGER IF EXISTS update_prices_updated_at ON public.prices;
CREATE TRIGGER update_prices_updated_at
  BEFORE UPDATE ON public.prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
