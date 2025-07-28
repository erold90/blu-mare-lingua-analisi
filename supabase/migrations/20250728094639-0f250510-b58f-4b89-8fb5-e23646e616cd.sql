-- Fase 2: Sistema RLS migliorato per tutte le tabelle esistenti (correzione)
-- Rimuoviamo le policy troppo permissive e implementiamo sicurezza basata sui ruoli

-- 1. APARTMENTS TABLE - Solo admin/manager possono modificare, tutti possono leggere
DROP POLICY IF EXISTS "Allow public read access to apartments" ON public.apartments;
DROP POLICY IF EXISTS "Allow public write access to apartments" ON public.apartments;

CREATE POLICY "Public can view apartments" ON public.apartments
  FOR SELECT USING (true);

CREATE POLICY "Admin and managers can manage apartments" ON public.apartments
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 2. CLEANING_TASKS TABLE - Solo staff autorizzato
DROP POLICY IF EXISTS "Allow all operations on cleaning_tasks" ON public.cleaning_tasks;
DROP POLICY IF EXISTS "Allow public access to cleaning_tasks" ON public.cleaning_tasks;

CREATE POLICY "Staff can view cleaning tasks" ON public.cleaning_tasks
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role) OR
    public.has_role(auth.uid(), 'cleaner'::app_role)
  );

CREATE POLICY "Admin and managers can manage cleaning tasks" ON public.cleaning_tasks
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "Cleaners can update their assigned tasks" ON public.cleaning_tasks
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'cleaner'::app_role) AND 
    assignee = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 3. IMAGES TABLE - Controllo più granulare
DROP POLICY IF EXISTS "Allow public read access to images" ON public.images;
DROP POLICY IF EXISTS "Allow public write access to images" ON public.images;
DROP POLICY IF EXISTS "Anyone can delete image metadata" ON public.images;
DROP POLICY IF EXISTS "Anyone can insert image metadata" ON public.images;
DROP POLICY IF EXISTS "Anyone can update image metadata" ON public.images;
DROP POLICY IF EXISTS "Anyone can view images" ON public.images;
DROP POLICY IF EXISTS "Authenticated users can manage images" ON public.images;
DROP POLICY IF EXISTS "Public read access for images metadata" ON public.images;

CREATE POLICY "Public can view images" ON public.images
  FOR SELECT USING (true);

CREATE POLICY "Admin and managers can manage images" ON public.images
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 4. PRICES TABLE - Solo admin/manager possono modificare
DROP POLICY IF EXISTS "Allow delete on prices for everyone" ON public.prices;
DROP POLICY IF EXISTS "Allow insert on prices for everyone" ON public.prices;
DROP POLICY IF EXISTS "Allow public delete to prices" ON public.prices;
DROP POLICY IF EXISTS "Allow public read access to prices" ON public.prices;
DROP POLICY IF EXISTS "Allow public update to prices" ON public.prices;
DROP POLICY IF EXISTS "Allow public write access to prices" ON public.prices;
DROP POLICY IF EXISTS "Allow select on prices for everyone" ON public.prices;
DROP POLICY IF EXISTS "Allow update on prices for everyone" ON public.prices;

CREATE POLICY "Public can view prices" ON public.prices
  FOR SELECT USING (true);

CREATE POLICY "Admin and managers can manage prices" ON public.prices
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 5. RESERVATIONS TABLE - Controllo basato sui ruoli e proprietà
DROP POLICY IF EXISTS "Allow anonymous access to create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow anonymous access to delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow anonymous access to update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow anonymous access to view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public delete for reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public insert for reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public read access to reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public update for reservations" ON public.reservations;

CREATE POLICY "Staff can view all reservations" ON public.reservations
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role) OR
    public.has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admin and managers can manage reservations" ON public.reservations
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "Staff can create reservations" ON public.reservations
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role) OR
    public.has_role(auth.uid(), 'staff'::app_role)
  );

-- 6. QUOTE_LOGS TABLE - Solo staff può vedere, tutti possono creare quote
DROP POLICY IF EXISTS "Public can manage quotes" ON public.quote_logs;

CREATE POLICY "Anyone can create quotes" ON public.quote_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view quotes" ON public.quote_logs
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role) OR
    public.has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admin and managers can manage quotes" ON public.quote_logs
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 7. SITE_VISITS TABLE - Manteniamo le policy esistenti ma aggiungiamo controllo admin
CREATE POLICY "Admin can manage site visits" ON public.site_visits
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Aggiorniamo la funzione di cleanup per essere più sicura
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
RETURNS TABLE(deleted_visits bigint, deleted_quotes bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  visits_deleted BIGINT;
  quotes_deleted BIGINT;
BEGIN
  -- Verifica che solo admin possa eseguire questa funzione
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admin users can perform cleanup operations';
  END IF;
  
  -- Elimina visite più vecchie di 6 mesi
  DELETE FROM public.site_visits 
  WHERE created_at < NOW() - INTERVAL '6 months';
  GET DIAGNOSTICS visits_deleted = ROW_COUNT;
  
  -- Elimina quote incomplete più vecchie di 3 mesi
  DELETE FROM public.quote_logs 
  WHERE created_at < NOW() - INTERVAL '3 months' AND completed = false;
  GET DIAGNOSTICS quotes_deleted = ROW_COUNT;
  
  RETURN QUERY SELECT visits_deleted, quotes_deleted;
END;
$$;