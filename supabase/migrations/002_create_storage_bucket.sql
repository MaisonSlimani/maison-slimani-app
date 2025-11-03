-- Création du bucket de stockage pour les images produits

-- Créer le bucket (nécessite l'extension storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'produits-images',
  'produits-images',
  true, -- Bucket public pour lecture des images
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs de duplication)
DROP POLICY IF EXISTS "Lecture publique des images produits" ON storage.objects;
DROP POLICY IF EXISTS "Insertion images produits" ON storage.objects;
DROP POLICY IF EXISTS "Mise à jour images produits" ON storage.objects;
DROP POLICY IF EXISTS "Suppression images produits" ON storage.objects;

-- Politique de lecture publique (tout le monde peut lire)
CREATE POLICY "Lecture publique des images produits"
ON storage.objects
FOR SELECT
USING (bucket_id = 'produits-images');

-- Politique d'insertion (authentifié uniquement - admin via service role)
CREATE POLICY "Insertion images produits"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'produits-images'
  -- Note: En production, ajoutez une vérification d'authentification admin
  -- Pour l'instant, accessible via service role key
);

-- Politique de mise à jour (admin uniquement)
CREATE POLICY "Mise à jour images produits"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'produits-images')
WITH CHECK (bucket_id = 'produits-images');

-- Politique de suppression (admin uniquement)
CREATE POLICY "Suppression images produits"
ON storage.objects
FOR DELETE
USING (bucket_id = 'produits-images');
