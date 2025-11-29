-- Migration: Add upsell products column
-- This enables manual configuration of product recommendations (upsells)

ALTER TABLE produits 
ADD COLUMN IF NOT EXISTS upsell_products JSONB DEFAULT '[]'::jsonb;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_produits_upsell ON produits USING GIN (upsell_products);

-- Comment
COMMENT ON COLUMN produits.upsell_products IS 'Array of product IDs to suggest as upsells: ["uuid1", "uuid2", ...]. Maximum 5 products recommended.';

