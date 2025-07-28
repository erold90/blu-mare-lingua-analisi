-- Crea un utente di test direttamente nella tabella user_profiles
-- con un ID fittizio per ora (dovrà essere sostituito con un vero ID utente)
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Inserisci il profilo utente per erold
    INSERT INTO public.user_profiles (
        user_id,
        username,
        first_name,
        last_name,
        email
    ) VALUES (
        test_user_id,
        'erold',
        'Erold',
        'Admin',
        'erold@villamareblu.it'
    );

    -- Assegna il ruolo di admin
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (test_user_id, 'admin'::app_role, test_user_id);
END $$;