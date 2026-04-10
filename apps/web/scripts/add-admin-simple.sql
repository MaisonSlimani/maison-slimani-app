-- ============================================
-- EASY ADMIN CREATION - SUPABASE SQL EDITOR
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Replace 'your-email@example.com' with your email
-- 3. Replace 'YOUR_PASSWORD_HASH' with a bcrypt hash (see below)
-- 4. Run this SQL
--
-- TO GET PASSWORD HASH:
-- Option A: Use online tool: https://bcrypt-generator.com/
--   - Enter your password
--   - Use 12 rounds
--   - Copy the hash
--
-- Option B: Use Node.js one-liner:
--   node -e "const bcrypt=require('bcrypt');bcrypt.hash('YOUR_PASSWORD',12).then(h=>console.log(h))"
--
-- ============================================

-- Insert new admin (replace values below)
INSERT INTO admins (email, hash_mdp, role)
VALUES (
  'your-email@example.com',  -- ⬅️ CHANGE THIS
  'YOUR_PASSWORD_HASH',      -- ⬅️ CHANGE THIS (bcrypt hash)
  'super-admin'
)
ON CONFLICT (email) 
DO UPDATE SET 
  hash_mdp = EXCLUDED.hash_mdp,
  role = EXCLUDED.role;

-- Verify it was created
SELECT email, role, created_at 
FROM admins 
WHERE email = 'your-email@example.com';  -- ⬅️ CHANGE THIS

