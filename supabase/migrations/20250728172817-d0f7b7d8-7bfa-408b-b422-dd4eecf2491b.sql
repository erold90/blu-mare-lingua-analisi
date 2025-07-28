-- Assicuriamoci che l'utente erold@villamareblu.it abbia il ruolo admin
INSERT INTO user_roles (user_id, role, granted_by) 
SELECT 
  '7b221f03-82ca-4c43-b946-7aaa282c9768'::uuid,
  'admin'::app_role,
  '7b221f03-82ca-4c43-b946-7aaa282c9768'::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = '7b221f03-82ca-4c43-b946-7aaa282c9768'::uuid 
  AND role = 'admin'::app_role
);

-- Verifica che l'utente abbia ora il ruolo admin
SELECT user_id, role FROM user_roles WHERE user_id = '7b221f03-82ca-4c43-b946-7aaa282c9768'::uuid;