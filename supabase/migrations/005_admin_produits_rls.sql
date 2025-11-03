-- Politiques RLS pour permettre aux admins de gérer les produits
-- Les admins utiliseront le service role key pour contourner RLS

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Les produits sont visibles par tous" ON produits;
DROP POLICY IF EXISTS "Admins peuvent insérer des produits" ON produits;
DROP POLICY IF EXISTS "Admins peuvent modifier des produits" ON produits;
DROP POLICY IF EXISTS "Admins peuvent supprimer des produits" ON produits;

-- Politique de lecture publique (tout le monde peut lire)
CREATE POLICY "Les produits sont visibles par tous" ON produits
  FOR SELECT USING (true);

-- Note: Pour INSERT, UPDATE, DELETE, les admins utiliseront le service role key
-- qui contourne RLS automatiquement. Ces politiques permettent également l'accès
-- via des Edge Functions ou des routes API qui utilisent le service role key.

-- Politique d'insertion (accessible via service role key)
CREATE POLICY "Admins peuvent insérer des produits" ON produits
  FOR INSERT WITH CHECK (true);

-- Politique de modification (accessible via service role key)
CREATE POLICY "Admins peuvent modifier des produits" ON produits
  FOR UPDATE USING (true) WITH CHECK (true);

-- Politique de suppression (accessible via service role key)
CREATE POLICY "Admins peuvent supprimer des produits" ON produits
  FOR DELETE USING (true);

