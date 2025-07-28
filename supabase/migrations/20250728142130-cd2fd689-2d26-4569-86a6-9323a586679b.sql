-- Aggiungiamo policy più permissive per l'admin per risolvere i problemi di accesso
-- Rimuoviamo le policy esistenti che potrebbero essere troppo restrittive e le ricreiamo

-- RESERVATIONS: Permessi più ampi per admin
DROP POLICY IF EXISTS "Admin and managers can manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Staff can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Staff can create reservations" ON public.reservations;

CREATE POLICY "Admin can manage all reservations"
ON public.reservations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Staff can view reservations"
ON public.reservations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'manager', 'staff')
  )
);

-- PRICES: Permessi più ampi per admin
DROP POLICY IF EXISTS "Admin and managers can manage prices" ON public.prices;
DROP POLICY IF EXISTS "Public can view prices" ON public.prices;

CREATE POLICY "Admin can manage all prices"
ON public.prices
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Public can view prices"
ON public.prices
FOR SELECT
USING (true);

-- IMAGES: Permessi più ampi per admin
DROP POLICY IF EXISTS "Admin and managers can manage images" ON public.images;
DROP POLICY IF EXISTS "Public can view images" ON public.images;

CREATE POLICY "Admin can manage all images"
ON public.images
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Public can view images"
ON public.images
FOR SELECT
USING (true);

-- CLEANING TASKS: Permessi più ampi per admin
DROP POLICY IF EXISTS "Admin and managers can manage cleaning tasks" ON public.cleaning_tasks;
DROP POLICY IF EXISTS "Cleaners can update their assigned tasks" ON public.cleaning_tasks;
DROP POLICY IF EXISTS "Staff can view cleaning tasks" ON public.cleaning_tasks;

CREATE POLICY "Admin can manage all cleaning tasks"
ON public.cleaning_tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Staff can view cleaning tasks"
ON public.cleaning_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'manager', 'staff', 'cleaner')
  )
);