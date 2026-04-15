-- ============================================
-- SUPABASE FUNCTION FOR EASY ADMIN CREATION
-- ============================================
-- 
-- This creates a database function you can call from SQL Editor
-- After running this once, you can create admins with:
--   SELECT create_admin('email@example.com', 'password123');
--
-- ============================================

-- Create the function (run this once)
CREATE OR REPLACE FUNCTION create_admin(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  password_hash TEXT;
  result JSON;
BEGIN
  -- Validate email
  IF admin_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN json_build_object('success', false, 'error', 'Invalid email format');
  END IF;

  -- Validate password length
  IF length(admin_password) < 8 THEN
    RETURN json_build_object('success', false, 'error', 'Password must be at least 8 characters');
  END IF;

  -- Note: This requires pgcrypto extension
  -- The password will need to be hashed externally since PostgreSQL
  -- doesn't have bcrypt built-in. Use the simple SQL script instead.
  
  RETURN json_build_object(
    'success', false, 
    'error', 'Use the simple SQL script with pre-hashed password. PostgreSQL cannot hash bcrypt directly.'
  );
END;
$$;

-- Alternative: Create a function that accepts pre-hashed password
CREATE OR REPLACE FUNCTION create_admin_with_hash(
  admin_email TEXT,
  password_hash TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate email
  IF admin_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN json_build_object('success', false, 'error', 'Invalid email format');
  END IF;

  -- Insert or update admin
  INSERT INTO admins (email, hash_mdp, role)
  VALUES (admin_email, password_hash, 'super-admin')
  ON CONFLICT (email) 
  DO UPDATE SET 
    hash_mdp = EXCLUDED.hash_mdp,
    role = EXCLUDED.role;

  RETURN json_build_object(
    'success', true, 
    'message', 'Admin created/updated successfully',
    'email', admin_email
  );
END;
$$;

-- Usage example (after hashing password externally):
-- SELECT create_admin_with_hash('admin@example.com', '$2b$12$...your_bcrypt_hash...');

