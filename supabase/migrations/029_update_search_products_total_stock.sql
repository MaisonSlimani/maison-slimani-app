-- Update search_products function to include total_stock
-- This is a separate migration in case 016_add_fulltext_search.sql was already run

-- Drop the existing function first (to allow return type change)
DROP FUNCTION IF EXISTS search_products(TEXT, TEXT, INTEGER, INTEGER) CASCADE;

-- Recreate the function with total_stock in return type
CREATE FUNCTION search_products(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  nom TEXT,
  description TEXT,
  prix NUMERIC,
  stock INTEGER,
  total_stock INTEGER,
  categorie TEXT,
  vedette BOOLEAN,
  image_url TEXT,
  images JSONB,
  couleurs JSONB,
  has_colors BOOLEAN,
  taille TEXT,
  date_ajout TIMESTAMP,
  rank REAL
) AS $$
DECLARE
  tsquery_value tsquery;
BEGIN
  -- Convert search query to tsquery with French config
  tsquery_value := plainto_tsquery('french', search_query);
  
  RETURN QUERY
  SELECT 
    p.id,
    p.nom,
    p.description,
    p.prix,
    p.stock,
    p.total_stock,
    p.categorie,
    p.vedette,
    p.image_url,
    p.images,
    p.couleurs,
    p.has_colors,
    p.taille,
    p.date_ajout,
    -- Combine full-text rank with trigram similarity for better relevance
    (
      COALESCE(ts_rank(p.search_vector, tsquery_value), 0) * 2 +
      COALESCE(similarity(p.nom, search_query), 0) * 1.5 +
      COALESCE(similarity(p.description, search_query), 0) * 0.5
    )::REAL as rank
  FROM produits p
  WHERE 
    -- Full-text search OR fuzzy match (for typo tolerance)
    (
      p.search_vector @@ tsquery_value
      OR similarity(p.nom, search_query) > 0.2
      OR p.nom ILIKE '%' || search_query || '%'
      OR p.description ILIKE '%' || search_query || '%'
    )
    -- Apply category filter if provided
    AND (category_filter IS NULL OR p.categorie = category_filter)
  ORDER BY rank DESC, p.date_ajout DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

