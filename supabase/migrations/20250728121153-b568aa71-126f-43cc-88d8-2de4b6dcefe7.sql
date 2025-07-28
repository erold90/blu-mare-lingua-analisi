-- Crea il profilo per l'utente erold appena creato
INSERT INTO public.user_profiles (
    user_id,
    username,
    first_name,
    last_name,
    email
) VALUES (
    '7b221f03-82ca-4c43-b946-7aaa282c9768',
    'erold',
    'Erold',
    'Admin',
    'erold@villamareblu.it'
) ON CONFLICT (user_id) DO NOTHING;

-- Assegna il ruolo di admin
INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES (
    '7b221f03-82ca-4c43-b946-7aaa282c9768',
    'admin'::app_role,
    '7b221f03-82ca-4c43-b946-7aaa282c9768'
) ON CONFLICT (user_id, role) DO NOTHING;