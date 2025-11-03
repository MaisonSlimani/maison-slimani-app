-- Migration : Ajout de la colonne 'taille' à la table 'produits'
-- La taille est optionnelle et peut être NULL pour les produits sans taille spécifique

ALTER TABLE produits 
ADD COLUMN IF NOT EXISTS taille TEXT;

-- Ajouter un index pour améliorer les performances lors des recherches par taille
CREATE INDEX IF NOT EXISTS idx_produits_taille ON produits(taille) WHERE taille IS NOT NULL;

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN produits.taille IS 'Taille du produit (ex: 40, 41, 42, etc. pour les chaussures)';

