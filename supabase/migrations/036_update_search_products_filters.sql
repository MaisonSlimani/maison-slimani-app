-- Update search_products function to include server-side filtering
-- This allows for performant filtering of price, stock, colors, and sizes

DROP FUNCTION IF EXISTS search_products(TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS search_products(TEXT, TEXT, NUMERIC, NUMERIC, BOOLEAN, TEXT[], TEXT[], TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,
  in_stock BOOLEAN DEFAULT NULL,
  couleur_filter TEXT[] DEFAULT NULL,
  taille_filter TEXT[] DEFAULT NULL,
  sort_by TEXT DEFAULT 'pertinence',
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
  tailles JSONB,
  date_ajout TIMESTAMP,
  rank REAL
) AS $$
DECLARE
  tsquery_value tsquery;
  base_rank REAL;
BEGIN
  -- Handle empty search query
  IF search_query IS NULL OR TRIM(search_query) = '' THEN
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
      p.tailles,
      p.date_ajout,
      0::REAL as rank
    FROM produits p
    WHERE 
      -- Category Filter
      (category_filter IS NULL OR p.categorie = category_filter)
      -- Price Filter
      AND (min_price IS NULL OR p.prix >= min_price)
      AND (max_price IS NULL OR p.prix <= max_price)
      -- Stock Filter (checking total_stock which includes all variations)
      AND (in_stock IS NULL OR (in_stock = TRUE AND p.total_stock > 0) OR (in_stock = FALSE AND p.total_stock <= 0))
      -- Color Filter
      AND (
        couleur_filter IS NULL 
        OR cardinality(couleur_filter) = 0
        OR (
          p.has_colors = TRUE 
          AND EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(p.couleurs) c 
            WHERE c->>'nom' = ANY(couleur_filter)
          )
        )
      )
      -- Size Filter
      AND (
        taille_filter IS NULL 
        OR cardinality(taille_filter) = 0
        OR (
          -- Case 1: Product has colors -> check sizes inside colors
          (
            p.has_colors = TRUE 
            AND EXISTS (
              SELECT 1 
              FROM jsonb_array_elements(p.couleurs) c,
                   jsonb_array_elements(c->'tailles') t
              WHERE t->>'nom' = ANY(taille_filter)
            )
          )
          OR
          -- Case 2: Product has no colors -> check top-level tailles
          (
            (p.has_colors = FALSE OR p.has_colors IS NULL)
            AND EXISTS (
              SELECT 1 
              FROM jsonb_array_elements(p.tailles) t
              WHERE t->>'nom' = ANY(taille_filter)
            )
          )
        )
      )
    ORDER BY 
      CASE sort_by
        WHEN 'prix_asc' THEN p.prix
        WHEN 'prix_desc' THEN -p.prix
        WHEN 'nouveaute' THEN EXTRACT(EPOCH FROM p.date_ajout) * -1
        ELSE EXTRACT(EPOCH FROM p.date_ajout) * -1 -- Default to newest for empty search
      END ASC
    LIMIT limit_count
    OFFSET offset_count;
  ELSE
    -- Search with text query
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
      p.tailles,
      p.date_ajout,
      (
        COALESCE(ts_rank(p.search_vector, tsquery_value), 0) * 2 +
        COALESCE(similarity(p.nom, search_query), 0) * 1.5 +
        COALESCE(similarity(p.description, search_query), 0) * 0.5
      )::REAL as rank
    FROM produits p
    WHERE 
      -- Full-text search conditions
      (
        p.search_vector @@ tsquery_value
        OR similarity(p.nom, search_query) > 0.2
        OR p.nom ILIKE '%' || search_query || '%'
        OR p.description ILIKE '%' || search_query || '%'
      )
      -- Category Filter
      AND (category_filter IS NULL OR p.categorie = category_filter)
      -- Price Filter
      AND (min_price IS NULL OR p.prix >= min_price)
      AND (max_price IS NULL OR p.prix <= max_price)
      -- Stock Filter
      AND (in_stock IS NULL OR (in_stock = TRUE AND p.total_stock > 0) OR (in_stock = FALSE AND p.total_stock <= 0))
      -- Color Filter
      AND (
        couleur_filter IS NULL 
        OR cardinality(couleur_filter) = 0
        OR (
          p.has_colors = TRUE 
          AND EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(p.couleurs) c 
            WHERE c->>'nom' = ANY(couleur_filter)
          )
        )
      )
      -- Size Filter
      AND (
        taille_filter IS NULL 
        OR cardinality(taille_filter) = 0
        OR (
          -- Case 1: Product has colors -> check sizes inside colors
          (
            p.has_colors = TRUE 
            AND EXISTS (
              SELECT 1 
              FROM jsonb_array_elements(p.couleurs) c,
                   jsonb_array_elements(c->'tailles') t
              WHERE t->>'nom' = ANY(taille_filter)
            )
          )
          OR
          -- Case 2: Product has no colors -> check top-level tailles
          (
            (p.has_colors = FALSE OR p.has_colors IS NULL)
            AND EXISTS (
              SELECT 1 
              FROM jsonb_array_elements(p.tailles) t
              WHERE t->>'nom' = ANY(taille_filter)
            )
          )
        )
      )
    ORDER BY 
      CASE sort_by
        WHEN 'pertinence' THEN rank
        WHEN 'prix_asc' THEN p.prix
        WHEN 'prix_desc' THEN -p.prix
        WHEN 'nouveaute' THEN EXTRACT(EPOCH FROM p.date_ajout) * -1
        ELSE rank -- Default to rank for search
      END DESC, -- Note: rank is DESC, but price can be ASC. We handle direction in CASE using negation for DESC sorts
      p.date_ajout DESC
    LIMIT limit_count
    OFFSET offset_count;
  END IF;
END;
$$ LANGUAGE plpgsql;
