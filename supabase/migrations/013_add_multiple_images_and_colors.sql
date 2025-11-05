-- Migration: Ajout du support pour plusieurs images et couleurs par produit

-- Ajouter les colonnes pour les images multiples et les couleurs
ALTER TABLE produits 
ADD COLUMN IF NOT EXISTS has_colors BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS couleurs JSONB DEFAULT '[]'::jsonb;

-- Migration des données existantes: convertir image_url en format images
-- Si image_url existe, créer un array avec cette image
UPDATE produits 
SET images = COALESCE(
  jsonb_build_array(
    jsonb_build_object(
      'url', image_url,
      'couleur', NULL,
      'ordre', 1
    )
  ),
  '[]'::jsonb
)
WHERE image_url IS NOT NULL AND image_url != '' AND images = '[]'::jsonb;

-- Créer un index pour améliorer les performances des requêtes JSONB
CREATE INDEX IF NOT EXISTS idx_produits_images ON produits USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_produits_couleurs ON produits USING GIN (couleurs);

-- Commentaire sur la structure JSONB attendue:
-- has_colors: true si le produit a des variantes de couleur, false sinon
-- images: [{"url": "string", "ordre": number}] - uniquement pour produits sans couleurs
-- couleurs: [{"nom": "string", "code": "string", "images": ["url1", "url2", ...], "stock": number, "taille": "string"}]
--   - Chaque couleur a ses propres images, son propre stock et ses propres tailles

