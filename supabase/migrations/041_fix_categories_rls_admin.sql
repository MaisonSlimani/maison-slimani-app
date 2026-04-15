-- Migration: Fix Category RLS policies for Admin access
-- This allows the Admin app to create and manage categories

-- 1. Ensure RLS is enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

-- 3. Create permissive policies for the authenticated service role
-- Since the Admin app uses the service role key, we grant access
CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE USING (true);
