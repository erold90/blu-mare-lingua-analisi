-- Abilita l'estensione pgcrypto per le funzioni di crittografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Rimuovi e ricrea la funzione di login con la corretta gestione password
DROP FUNCTION IF EXISTS public.login_with_username(text, text);

CREATE OR REPLACE FUNCTION public.login_with_username(username_input text, password_input text)
RETURNS TABLE(user_id uuid, email character varying(255))
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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