-- Migration: Add Full-Text Search Support for Products
-- This enables PostgreSQL full-text search with French language support,
-- weighted relevance scoring, and fuzzy matching for typo tolerance.

-- ============================================
-- PART 1: Full-Text Search with tsvector
-- ============================================

-- Add tsvector column for full-text search
ALTER TABLE produits ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to automatically update the search vector
-- Weights: A = highest (product name), B = medium (description), C = lower (category)
CREATE OR REPLACE FUNCTION produits_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('french', coalesce(NEW.nom, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(NEW.categorie, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search_vector on INSERT or UPDATE
DROP TRIGGER IF EXISTS produits_search_vector_trigger ON produits;
CREATE TRIGGER produits_search_vector_trigger
  BEFORE INSERT OR UPDATE OF nom, description, categorie ON produits
  FOR EACH ROW EXECUTE FUNCTION produits_search_vector_update();

-- Backfill existing products with search vectors
UPDATE produits SET search_vector = 
  setweight(to_tsvector('french', coalesce(nom, '')), 'A') ||
  setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('french', coalesce(categorie, '')), 'C');

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_produits_search_vector ON produits USING GIN(search_vector);

-- ============================================
-- PART 2: Fuzzy Matching with pg_trgm
-- ============================================

-- Install pg_trgm extension for trigram-based fuzzy matching
-- This enables typo tolerance (e.g., "chassure" matches "chaussure")
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram indexes for fuzzy matching on product name
CREATE INDEX IF NOT EXISTS idx_produits_nom_trgm ON produits USING GIN(nom gin_trgm_ops);

-- ============================================
-- PART 3: Search Analytics Table
-- ============================================

-- Table to track search queries for trending/popular searches
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for search analytics
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries(query);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at DESC);

-- RLS for search_queries
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for tracking searches)
CREATE POLICY "Allow public insert on search_queries" ON search_queries
  FOR INSERT WITH CHECK (true);

-- Allow public read for trending searches
CREATE POLICY "Allow public read on search_queries" ON search_queries
  FOR SELECT USING (true);

-- ============================================
-- PART 4: Advanced Search RPC Function
-- ============================================

-- Create a function that combines full-text search with fuzzy matching
-- Returns products sorted by relevance
CREATE OR REPLACE FUNCTION search_products(
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

-- ============================================
-- PART 5: Search Suggestions Functions
-- ============================================

-- Function to get popular/trending searches (last 7 days)
CREATE OR REPLACE FUNCTION get_trending_searches(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (query TEXT, search_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.query,
    COUNT(*)::BIGINT as search_count
  FROM search_queries sq
  WHERE sq.created_at > NOW() - INTERVAL '7 days'
    AND sq.results_count > 0
  GROUP BY sq.query
  ORDER BY search_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get product name suggestions (autocomplete)
CREATE OR REPLACE FUNCTION get_product_suggestions(
  search_prefix TEXT,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (suggestion TEXT, product_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (p.nom)
    p.nom as suggestion,
    p.id as product_id
  FROM produits p
  WHERE 
    p.nom ILIKE search_prefix || '%'
    OR similarity(p.nom, search_prefix) > 0.3
  ORDER BY p.nom, similarity(p.nom, search_prefix) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get category suggestions based on search
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
    c.nom as category_name,
    c.slug as category_slug,
    COUNT(p.id)::BIGINT as product_count
  FROM categories c
  LEFT JOIN produits p ON p.categorie = c.nom
  WHERE 
    c.active = true
    AND (
      c.nom ILIKE '%' || search_term || '%'
      OR c.description ILIKE '%' || search_term || '%'
      OR similarity(c.nom, search_term) > 0.3
    )
  GROUP BY c.nom, c.slug, c.ordre
  ORDER BY product_count DESC, c.ordre
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

