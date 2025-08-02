-- Aggiorna la password dell'utente esistente
UPDATE auth.users 
SET 
  encrypted_password = crypt('@Folgore33', gen_salt('bf')),
  updated_at = now()
WHERE id = '7b221f03-82ca-4c43-b946-7aaa282c9768';