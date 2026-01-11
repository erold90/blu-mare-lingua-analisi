-- Security Hardening Migration
-- Obiettivo: Sicurezza 10/10

-- =============================================
-- 1. PROTEZIONE TABELLE ADMIN
-- =============================================

-- Admin profiles: solo utenti autenticati possono leggere i propri dati
DROP POLICY IF EXISTS "Allow public read access to admin_profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admin profiles are viewable by authenticated users" ON public.admin_profiles;

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin profiles viewable by owner only"
  ON public.admin_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin profiles updatable by owner only"
  ON public.admin_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admin notifications: solo per admin autenticati
DROP POLICY IF EXISTS "Allow public access to admin_notifications" ON public.admin_notifications;

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin notifications for authenticated admins only"
  ON public.admin_notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- =============================================
-- 2. PROTEZIONE PREZZI (solo lettura pubblica)
-- =============================================

DROP POLICY IF EXISTS "Allow public write access to prices" ON public.prices;
DROP POLICY IF EXISTS "Allow public update to prices" ON public.prices;
DROP POLICY IF EXISTS "Allow public delete to prices" ON public.prices;

-- Mantieni solo lettura pubblica
CREATE POLICY "Prices read only for public"
  ON public.prices
  FOR SELECT
  USING (true);

-- Solo admin possono modificare
CREATE POLICY "Prices writable by admin only"
  ON public.prices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Prices updatable by admin only"
  ON public.prices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Prices deletable by admin only"
  ON public.prices
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- =============================================
-- 3. PROTEZIONE APPARTAMENTI
-- =============================================

DROP POLICY IF EXISTS "Allow public write access to apartments" ON public.apartments;

CREATE POLICY "Apartments writable by admin only"
  ON public.apartments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Apartments updatable by admin only"
  ON public.apartments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Apartments deletable by admin only"
  ON public.apartments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- =============================================
-- 4. PROTEZIONE PRENOTAZIONI
-- =============================================

DROP POLICY IF EXISTS "Allow public update for reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public delete for reservations" ON public.reservations;

CREATE POLICY "Reservations updatable by admin only"
  ON public.reservations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Reservations deletable by admin only"
  ON public.reservations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- =============================================
-- 5. RATE LIMITING TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  action_type TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  UNIQUE(ip_address, action_type)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Solo il server può gestire rate limits
CREATE POLICY "Rate limits managed by service role only"
  ON public.rate_limits
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================
-- 6. FUNZIONE RATE LIMITING SERVER-SIDE
-- =============================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_address TEXT,
  p_action_type TEXT,
  p_max_attempts INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
  v_is_blocked BOOLEAN := FALSE;
BEGIN
  -- Cerca record esistente
  SELECT * INTO v_record
  FROM public.rate_limits
  WHERE ip_address = p_ip_address AND action_type = p_action_type;

  IF v_record IS NULL THEN
    -- Primo tentativo
    INSERT INTO public.rate_limits (ip_address, action_type)
    VALUES (p_ip_address, p_action_type);
    RETURN FALSE; -- Non bloccato
  END IF;

  -- Controlla se è bloccato
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > NOW() THEN
    RETURN TRUE; -- Bloccato
  END IF;

  -- Controlla se la finestra è scaduta
  IF v_record.first_attempt_at < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
    -- Reset contatore
    UPDATE public.rate_limits
    SET attempt_count = 1, first_attempt_at = NOW(), last_attempt_at = NOW(), blocked_until = NULL
    WHERE ip_address = p_ip_address AND action_type = p_action_type;
    RETURN FALSE;
  END IF;

  -- Incrementa contatore
  UPDATE public.rate_limits
  SET attempt_count = attempt_count + 1, last_attempt_at = NOW()
  WHERE ip_address = p_ip_address AND action_type = p_action_type;

  -- Controlla se ha superato il limite
  IF v_record.attempt_count >= p_max_attempts THEN
    -- Blocca per il doppio della finestra
    UPDATE public.rate_limits
    SET blocked_until = NOW() + (p_window_minutes * 2 || ' minutes')::INTERVAL
    WHERE ip_address = p_ip_address AND action_type = p_action_type;
    RETURN TRUE; -- Bloccato
  END IF;

  RETURN FALSE; -- Non bloccato
END;
$$;

-- =============================================
-- 7. FUNZIONE VALIDAZIONE QUOTE REQUEST
-- =============================================

CREATE OR REPLACE FUNCTION public.validate_quote_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validazione email
  IF NEW.guest_email IS NULL OR NEW.guest_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Email non valida';
  END IF;

  -- Validazione nome (no script tags)
  IF NEW.guest_name ~ '<script|javascript:|data:|vbscript:' THEN
    RAISE EXCEPTION 'Nome contiene contenuto non valido';
  END IF;

  -- Validazione date
  IF NEW.checkin_date IS NULL OR NEW.checkout_date IS NULL THEN
    RAISE EXCEPTION 'Date obbligatorie';
  END IF;

  IF NEW.checkin_date >= NEW.checkout_date THEN
    RAISE EXCEPTION 'Data checkout deve essere dopo checkin';
  END IF;

  IF NEW.checkin_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Data checkin non può essere nel passato';
  END IF;

  -- Sanitizza input
  NEW.guest_name := regexp_replace(NEW.guest_name, '<[^>]*>', '', 'g');
  NEW.guest_phone := regexp_replace(COALESCE(NEW.guest_phone, ''), '[^0-9+\-\(\)\s]', '', 'g');

  RETURN NEW;
END;
$$;

-- Applica trigger
DROP TRIGGER IF EXISTS validate_quote_request_trigger ON public.quote_requests;
CREATE TRIGGER validate_quote_request_trigger
  BEFORE INSERT OR UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_quote_request();

-- =============================================
-- 8. AUDIT LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Solo admin possono leggere
CREATE POLICY "Audit log readable by admin only"
  ON public.security_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- =============================================
-- 9. CLEANUP AUTOMATICO
-- =============================================

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE last_attempt_at < NOW() - INTERVAL '7 days';

  DELETE FROM public.security_audit_log
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- =============================================
-- 10. INDICI PER PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action ON public.rate_limits(ip_address, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON public.rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_event ON public.security_audit_log(event_type);
