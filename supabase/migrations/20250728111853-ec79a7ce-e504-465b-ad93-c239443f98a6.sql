-- Crea un utente amministratore con username erold
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'erold@admin.local',
  crypt('205647', gen_salt('bf')),
  now(),
  '{"username": "erold", "first_name": "Erold", "last_name": "Admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Aggiungi una colonna username alla tabella user_profiles se non esiste già
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Aggiorna il trigger per gestire anche lo username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    first_name, 
    last_name, 
    email,
    username
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'username'
  );
  
  -- Se è il primo utente o è l'utente erold, diventa admin automaticamente
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') OR NEW.raw_user_meta_data ->> 'username' = 'erold' THEN
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (NEW.id, 'admin', NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Crea una funzione per il login con username
CREATE OR REPLACE FUNCTION public.login_with_username(username_input text, password_input text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email
  FROM auth.users u
  JOIN public.user_profiles p ON u.id = p.user_id
  WHERE p.username = username_input
  AND u.encrypted_password = crypt(password_input, u.encrypted_password);
END;
$function$;