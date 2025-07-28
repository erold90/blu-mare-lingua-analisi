-- Crea l'utente erold direttamente nel database
-- Prima inserisci l'utente nella tabella auth.users
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  phone_change,
  last_sign_in_at,
  raw_app_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'erold@villamareblu.it',
  crypt('205647', gen_salt('bf')),
  now(),
  '{"username": "erold", "first_name": "Erold", "last_name": "Admin"}',
  now(),
  now(),
  '',
  '',
  '',
  null,
  '{"provider": "email", "providers": ["email"]}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Poi crea il profilo utente corrispondente
INSERT INTO public.user_profiles (
  user_id,
  username,
  first_name,
  last_name,
  email
) 
SELECT 
  u.id,
  'erold',
  'Erold',
  'Admin',
  'erold@villamareblu.it'
FROM auth.users u 
WHERE u.email = 'erold@villamareblu.it'
ON CONFLICT (user_id) DO NOTHING;

-- Assegna il ruolo di admin
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT 
  u.id,
  'admin'::app_role,
  u.id
FROM auth.users u 
WHERE u.email = 'erold@villamareblu.it'
ON CONFLICT (user_id, role) DO NOTHING;