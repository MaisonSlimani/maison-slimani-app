-- Migration: Force schema cache reload by adding/removing a dummy column
ALTER TABLE categories ADD COLUMN _cache_bump BOOLEAN DEFAULT true;
ALTER TABLE categories DROP COLUMN _cache_bump;

ALTER TABLE produits ADD COLUMN _cache_bump BOOLEAN DEFAULT true;
ALTER TABLE produits DROP COLUMN _cache_bump;
