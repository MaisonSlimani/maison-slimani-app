-- ============================================
-- SETUP RAPIDE DU BUCKET STORAGE
-- Copiez-collez ce SQL dans Supabase > SQL Editor
-- ============================================

-- 1. Créer le bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'produits-images',
  'produits-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Lecture publique des images produits" ON storage.objects;
DROP POLICY IF EXISTS "Insertion images produits" ON storage.objects;
DROP POLICY IF EXISTS "Mise à jour images produits" ON storage.objects;
DROP POLICY IF EXISTS "Suppression images produits" ON storage.objects;

-- 3. Créer les nouvelles politiques
CREATE POLICY "Lecture publique des images produits"
ON storage.objects FOR SELECT
USING (bucket_id = 'produits-images');

CREATE POLICY "Insertion images produits"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'produits-images');

CREATE POLICY "Mise à jour images produits"
ON storage.objects FOR UPDATE
USING (bucket_id = 'produits-images')
WITH CHECK (bucket_id = 'produits-images');

CREATE POLICY "Suppression images produits"
ON storage.objects FOR DELETE
USING (bucket_id = 'produits-images');

-- 4. Vérifier (devrait retourner une ligne)
SELECT * FROM storage.buckets WHERE id = 'produits-images';

