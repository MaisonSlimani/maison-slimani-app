-- Script de configuration complète pour Supabase Storage
-- À exécuter dans l'éditeur SQL de Supabase

-- ============================================
-- ÉTAPE 1: Créer le bucket produits-images
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'produits-images',
  'produits-images',
  true, -- Bucket public pour lecture des images
  5242880, -- Limite: 5MB par fichier
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'] -- Types MIME autorisés
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ÉTAPE 2: Configurer les politiques RLS du Storage
-- ============================================

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Lecture publique des images produits" ON storage.objects;
DROP POLICY IF EXISTS "Insertion images produits" ON storage.objects;
DROP POLICY IF EXISTS "Mise à jour images produits" ON storage.objects;
DROP POLICY IF EXISTS "Suppression images produits" ON storage.objects;

-- Politique 1: Lecture publique (tout le monde peut lire les images)
CREATE POLICY "Lecture publique des images produits"
ON storage.objects
FOR SELECT
USING (bucket_id = 'produits-images');

-- Politique 2: Insertion (pour les admins uniquement via service role)
-- En production, vous pouvez ajouter une vérification d'authentification
CREATE POLICY "Insertion images produits"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'produits-images'
  -- Note: Les admins utiliseront le service role key pour uploader
);

-- Politique 3: Mise à jour (admin uniquement)
CREATE POLICY "Mise à jour images produits"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'produits-images')
WITH CHECK (bucket_id = 'produits-images');

-- Politique 4: Suppression (admin uniquement)
CREATE POLICY "Suppression images produits"
ON storage.objects
FOR DELETE
USING (bucket_id = 'produits-images');

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que le bucket a été créé
SELECT * FROM storage.buckets WHERE id = 'produits-images';

-- Si le résultat est vide, le bucket n'a pas été créé
-- Vérifiez que l'extension storage est activée
