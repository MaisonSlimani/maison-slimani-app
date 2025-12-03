-- Migration: Add Similar Products Function
-- This enables optimized SQL-based product recommendations using content-based filtering

-- ============================================
-- Function: get_similar_products
-- ============================================
-- Returns similar products based on:
-- 1. Same category (primary filter)
-- 2. Similar price range (±20% by default)
-- 3. Featured products prioritized
-- 4. In-stock products prioritized
-- 5. Excludes current product
--
-- Parameters:
--   product_id: UUID of the product to find similar products for
--   limit_count: Maximum number of products to return (default: 6)
--   price_tolerance: Price range tolerance (default: 0.2 = ±20%)
--   include_out_of_stock: Whether to include out-of-stock products (default: false)
--
-- Returns: Table with product fields and similarity score

CREATE OR REPLACE FUNCTION get_similar_products(
  product_id UUID,
  limit_count INTEGER DEFAULT 6,
  price_tolerance NUMERIC DEFAULT 0.2,
  include_out_of_stock BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  nom TEXT,
  description TEXT,
  prix NUMERIC,
  stock INTEGER,
  categorie TEXT,
  vedette BOOLEAN,
  image_url TEXT,
  images JSONB,
  couleurs JSONB,
  has_colors BOOLEAN,
  taille TEXT,
  date_ajout TIMESTAMP,
  similarity_score INTEGER
) AS $$
DECLARE
  current_product RECORD;
  price_min NUMERIC;
  price_max NUMERIC;
BEGIN
  -- Get current product details
  SELECT p.id, p.categorie, p.prix, p.vedette, p.stock, p.has_colors, p.couleurs
  INTO current_product
  FROM produits p
  WHERE p.id = product_id;

  -- If product not found, return empty result
  IF current_product IS NULL THEN
    RETURN;
  END IF;

  -- Calculate price range
  price_min := current_product.prix * (1 - price_tolerance);
  price_max := current_product.prix * (1 + price_tolerance);

  -- Return similar products with scoring
  RETURN QUERY
  SELECT 
    p.id,
    p.nom,
    p.description,
    p.prix,
    p.stock,
    p.categorie,
    p.vedette,
    p.image_url,
    p.images,
    p.couleurs,
    p.has_colors,
    p.taille,
    p.date_ajout,
    -- Calculate similarity score
    (
      -- Price similarity: +2 points if within price range
      CASE WHEN p.prix >= price_min AND p.prix <= price_max THEN 2 ELSE 0 END +
      -- Featured products: +1 point
      CASE WHEN p.vedette THEN 1 ELSE 0 END +
      -- In-stock products: +1 point (for products without colors)
      CASE WHEN NOT p.has_colors AND p.stock > 0 THEN 1 ELSE 0 END +
      -- In-stock products with colors: +1 point if any color has stock
      CASE 
        WHEN p.has_colors AND p.couleurs IS NOT NULL THEN
          CASE WHEN EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(p.couleurs) AS couleur
            WHERE (couleur->>'stock')::INTEGER > 0
          ) THEN 1 ELSE 0 END
        ELSE 0
      END
    )::INTEGER AS similarity_score
  FROM produits p
  WHERE 
    -- Same category
    p.categorie = current_product.categorie
    -- Exclude current product
    AND p.id != product_id
    -- Filter out-of-stock if configured
    -- Use total_stock which correctly handles products with colors
    AND (
      include_out_of_stock = true
      OR p.total_stock > 0
    )
  ORDER BY 
    similarity_score DESC,
    p.date_ajout DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment
COMMENT ON FUNCTION get_similar_products IS 
  'Returns similar products based on category, price range, featured status, and stock availability. Optimized for content-based recommendations.';

-- ============================================
-- Indexes for Performance (if not already exist)
-- ============================================
-- These indexes should already exist from previous migrations, but we ensure they're here

CREATE INDEX IF NOT EXISTS idx_produits_categorie ON produits(categorie);
CREATE INDEX IF NOT EXISTS idx_produits_prix ON produits(prix);
CREATE INDEX IF NOT EXISTS idx_produits_vedette ON produits(vedette);
CREATE INDEX IF NOT EXISTS idx_produits_date_ajout ON produits(date_ajout DESC);

