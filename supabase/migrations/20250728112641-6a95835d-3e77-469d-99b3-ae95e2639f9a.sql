-- Correggi la funzione di login con il tipo corretto per email
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

-- Verifica se l'utente erold esiste già, altrimenti crealo
DO $$
DECLARE
    user_exists boolean;
    new_user_id uuid;
BEGIN
    -- Controlla se esiste già un utente con username erold
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles 
        WHERE username = 'erold'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Genera un nuovo UUID per l'utente
        new_user_id := gen_random_uuid();
        
        -- Inserisci l'utente nella tabella auth.users
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
            new_user_id,
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
        
        -- Inserisci il profilo
        INSERT INTO public.user_profiles (
            user_id, 
            first_name, 
            last_name, 
            email,
            username
        ) VALUES (
            new_user_id,
            'Erold',
            'Admin',
            'erold@admin.local',
            'erold'
        );
        
        -- Assegna il ruolo admin
        INSERT INTO public.user_roles (user_id, role, granted_by)
        VALUES (new_user_id, 'admin', new_user_id);
    END IF;
END $$;