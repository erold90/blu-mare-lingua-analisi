-- Crea il profilo admin per l'utente esistente
INSERT INTO public.admin_profiles (user_id, full_name, role)
VALUES (
  '7b221f03-82ca-4c43-b946-7aaa282c9768',
  'Erold',
  'admin'
) 
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = now();