-- Aggiorna l'email dell'utente esistente
UPDATE auth.users 
SET 
  email = 'erold90@gmail.com',
  updated_at = now()
WHERE id = '7b221f03-82ca-4c43-b946-7aaa282c9768';