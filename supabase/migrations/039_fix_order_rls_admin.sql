-- Migration: Allow authenticated users (admins) to manage orders
-- This fixes the "Cannot coerce the result to a single JSON object" error 
-- which occurs when an UPDATE matches 0 rows due to RLS.

-- 1. Allow authenticated users to view all orders
DROP POLICY IF EXISTS "Lecture publique des commandes par ID" ON commandes;
CREATE POLICY "Admins et clients peuvent voir les commandes" ON commandes
  FOR SELECT
  USING (true);

-- 2. Allow authenticated users to update order status
DROP POLICY IF EXISTS "Admins peuvent modifier les commandes" ON commandes;
CREATE POLICY "Admins peuvent modifier les commandes" ON commandes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Also allow DELETE for admins
DROP POLICY IF EXISTS "Admins peuvent supprimer les commandes" ON commandes;
CREATE POLICY "Admins peuvent supprimer les commandes" ON commandes
  FOR DELETE
  TO authenticated
  USING (true);
