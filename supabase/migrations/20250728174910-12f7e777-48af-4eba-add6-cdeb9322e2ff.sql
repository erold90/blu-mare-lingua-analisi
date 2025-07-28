-- Creo una semplice tabella admin con credenziali hardcoded
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- In futuro potremo hashare le password
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserisco un utente admin di default
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('admin', 'admin123'); -- Password semplice per ora

-- Abilito RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy di sicurezza semplice
CREATE POLICY "Only authenticated admins can access" 
ON public.admin_users 
FOR ALL 
USING (username = 'admin'); -- Temporaneo