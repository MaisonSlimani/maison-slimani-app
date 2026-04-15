-- Migration 051: Fix Search Trigger for English Schema
-- The previous trigger function 016 still used 'nom' and 'categorie' which were renamed in 042.

-- 1. Update the search vector trigger function
CREATE OR REPLACE FUNCTION produits_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('french', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Re-create the trigger to use the correct columns for change detection
DROP TRIGGER IF EXISTS produits_search_vector_trigger ON produits;
CREATE TRIGGER produits_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, description, category ON produits
  FOR EACH ROW EXECUTE FUNCTION produits_search_vector_update();

-- 3. Fix trigram index
DROP INDEX IF EXISTS idx_produits_nom_trgm;
CREATE INDEX IF NOT EXISTS idx_produits_name_trgm ON produits USING GIN(name gin_trgm_ops);

-- 4. Update the suggestion function to use English name
CREATE OR REPLACE FUNCTION get_product_suggestions(
  search_prefix TEXT,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (suggestion TEXT, product_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (p.name)
    p.name as suggestion,
    p.id as product_id
  FROM produits p
  WHERE 
    p.name ILIKE search_prefix || '%'
    OR similarity(p.name, search_prefix) > 0.3
  ORDER BY p.name, similarity(p.name, search_prefix) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Update category suggestions to use name
CREATE OR REPLACE FUNCTION get_category_suggestions(
  search_term TEXT,
  limit_count INTEGER DEFAULT 3
)
RETURNS TABLE (
  category_name TEXT,
  category_slug TEXT,
  product_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name as category_name,
    c.slug as category_slug,
    COUNT(p.id)::BIGINT as product_count
  FROM categories c
  LEFT JOIN produits p ON p.category = c.name
  WHERE 
    c.is_active = true
    AND (
      c.name ILIKE '%' || search_term || '%'
      OR c.description ILIKE '%' || search_term || '%'
      OR similarity(c.name, search_term) > 0.3
    )
  GROUP BY c.name, c.slug, c.order
  ORDER BY product_count DESC, c.order
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
