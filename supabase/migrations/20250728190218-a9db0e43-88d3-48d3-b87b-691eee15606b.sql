-- Abilita RLS e crea policies per sicurezza

-- 1. Abilita RLS su tutte le tabelle
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- 2. Policies per tabella apartments (lettura pubblica)
CREATE POLICY "Public can view apartments" ON apartments FOR SELECT USING (true);

-- 3. Policies per pricing_periods (lettura pubblica, scrittura solo admin)
CREATE POLICY "Public can view active pricing periods" ON pricing_periods 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pricing periods" ON pricing_periods 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE username = current_setting('app.current_user', true)
    )
  );

-- 4. Policies per bookings (lettura pubblica per disponibilità, scrittura solo admin)
CREATE POLICY "Public can view confirmed bookings" ON bookings 
  FOR SELECT USING (status = 'confirmed');

CREATE POLICY "Admins can manage bookings" ON bookings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE username = current_setting('app.current_user', true)
    )
  );

-- 5. Policies per quote_requests (inserimento pubblico, lettura solo admin)
CREATE POLICY "Anyone can create quote requests" ON quote_requests 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view quote requests" ON quote_requests 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE username = current_setting('app.current_user', true)
    )
  );

-- 6. Policies per admin_notifications (solo admin)
CREATE POLICY "Admins can manage notifications" ON admin_notifications 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE username = current_setting('app.current_user', true)
    )
  );

-- 7. Aggiorna trigger functions con search_path sicuro
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' 
SET search_path = public;