-- Rimuovi la funzione di login esistente
DROP FUNCTION IF EXISTS public.login_with_username(text, text);

-- Crea una funzione di login semplificata che usa il sistema di autenticazione Supabase
-- Questa funzione restituisce solo l'email associata all'username per il login
CREATE OR REPLACE FUNCTION public.login_with_username(username_input text, password_input text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Semplicemente restituisce l'email dell'utente basata sull'username
  -- La validazione della password sarà gestita da Supabase Auth
  RETURN QUERY
  SELECT u.id, u.email::text
  FROM auth.users u
  JOIN public.user_profiles p ON u.id = p.user_id
  WHERE p.username = username_input;
END;
$function$;