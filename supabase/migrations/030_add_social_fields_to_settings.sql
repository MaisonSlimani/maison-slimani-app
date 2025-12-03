-- Migration : Ajout des champs sociaux (Facebook, Instagram) et Meta Pixel à la table settings

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS meta_pixel_code TEXT;

