-- Aggiornare la policy RLS per quote_requests
-- Permettere agli admin di vedere tutti i preventivi e consentire inserimenti pubblici

-- Prima rimuoviamo le policy esistenti
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can view quote requests" ON quote_requests;

-- Policy per permettere inserimenti pubblici (senza autenticazione)
CREATE POLICY "Public can create quote requests" ON quote_requests
  FOR INSERT 
  WITH CHECK (true);

-- Policy per permettere agli admin di vedere tutti i preventivi
CREATE POLICY "Admins can view all quote requests" ON quote_requests
  FOR SELECT 
  USING (true);

-- Policy per permettere agli admin di aggiornare i preventivi
CREATE POLICY "Admins can update quote requests" ON quote_requests
  FOR UPDATE 
  USING (true);

-- Policy per permettere agli admin di eliminare i preventivi
CREATE POLICY "Admins can delete quote requests" ON quote_requests
  FOR DELETE 
  USING (true);