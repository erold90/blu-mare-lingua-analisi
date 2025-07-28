-- Riattiva temporaneamente RLS sulla tabella prices con politiche corrette
-- che permettano agli admin di modificare i prezzi

-- Prima, abilita RLS sulla tabella prices
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- Poi, ricrea le policy per consentire operazioni admin
DROP POLICY IF EXISTS "Admin and managers can manage prices" ON public.prices;
DROP POLICY IF EXISTS "Public can view prices" ON public.prices;

-- Policy per leggere i prezzi (pubblico)
CREATE POLICY "Public can view prices" 
ON public.prices 
FOR SELECT 
USING (true);

-- Policy per gestire i prezzi (solo admin e manager)
CREATE POLICY "Admin and managers can manage prices" 
ON public.prices 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));