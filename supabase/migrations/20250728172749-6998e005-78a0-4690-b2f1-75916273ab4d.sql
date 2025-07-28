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

-- Verifica che l'enum app_role esista, altrimenti crealo
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('admin', 'manager', 'staff', 'cleaner');
    END IF;
END $$;

-- Verifica che la funzione has_role esista, altrimenti creala
CREATE OR REPLACE FUNCTION has_role(user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur 
    WHERE ur.user_id = $1 AND ur.role = $2
  );
$$;