-- Test delle policy RLS per verificare che funzionino con l'utente loggato
-- Questi sono test, non modifiche effettive

-- Verifica che l'utente abbia il ruolo admin
SELECT 
    u.email,
    ur.role,
    ur.granted_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id  
WHERE u.email = 'erold@villamareblu.it';

-- Test delle funzioni di controllo ruolo
SELECT 
    has_role('7b221f03-82ca-4c43-b946-7aaa282c9768'::uuid, 'admin'::app_role) as has_admin_role,
    get_current_user_role() as current_role;