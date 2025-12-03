-- ============================================
-- COMPLETE SUPABASE MIGRATION SCRIPT
-- ============================================
-- This script contains the complete schema, functions, triggers, RLS policies
-- to migrate database from old project to new project
-- 
-- Usage: Run this script in your NEW Supabase project SQL Editor
-- ============================================

-- ============================================
-- PART 1: Extensions
-- ============================================

-- Install pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- PART 2: Tables
-- ============================================

-- Table produits
CREATE TABLE IF NOT EXISTS produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  description TEXT NOT NULL,
  prix NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  categorie TEXT,
  vedette BOOLEAN DEFAULT false,
  date_ajout TIMESTAMP DEFAULT NOW(),
  taille TEXT,
  has_colors BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]'::jsonb,
  couleurs JSONB DEFAULT '[]'::jsonb,
  search_vector tsvector
);

-- Table commandes
CREATE TABLE IF NOT EXISTS commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_client TEXT NOT NULL,
  telephone TEXT NOT NULL,
  adresse TEXT NOT NULL,
  ville TEXT NOT NULL,
  produits JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  statut TEXT CHECK (statut IN ('En attente', 'Expédiée', 'Livrée', 'Annulée')) DEFAULT 'En attente',
  date_commande TIMESTAMP DEFAULT NOW()
);

-- Table admins
CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  hash_mdp TEXT NOT NULL,
  role TEXT DEFAULT 'super-admin'
);

-- Table categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  couleur TEXT,
  ordre INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Table settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_entreprise TEXT,
  telephone TEXT,
  adresse TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table search_queries (for full-text search analytics)
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PART 3: Indexes
-- ============================================

-- Indexes for produits
CREATE INDEX IF NOT EXISTS idx_produits_categorie ON produits(categorie);
CREATE INDEX IF NOT EXISTS idx_produits_vedette ON produits(vedette);
CREATE INDEX IF NOT EXISTS idx_produits_date_ajout ON produits(date_ajout DESC);
CREATE INDEX IF NOT EXISTS idx_produits_prix ON produits(prix);
CREATE INDEX IF NOT EXISTS idx_produits_taille ON produits(taille) WHERE taille IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_produits_images ON produits USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_produits_couleurs ON produits USING GIN (couleurs);
CREATE INDEX IF NOT EXISTS idx_produits_search_vector ON produits USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_produits_nom_trgm ON produits USING GIN(nom gin_trgm_ops);

-- Indexes for commandes
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_date ON commandes(date_commande);

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_ordre ON categories(ordre);

-- Indexes for search_queries
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries(query);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at DESC);

-- ============================================
-- PART 4: Row Level Security (RLS)
-- ============================================

-- Kích hoạt RLS cho tất cả tables
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: RLS Policies
-- ============================================

-- Policies cho produits
DROP POLICY IF EXISTS "Les produits sont visibles par tous" ON produits;
CREATE POLICY "Les produits sont visibles par tous" ON produits
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins peuvent insérer des produits" ON produits;
CREATE POLICY "Admins peuvent insérer des produits" ON produits
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins peuvent modifier des produits" ON produits;
CREATE POLICY "Admins peuvent modifier des produits" ON produits
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins peuvent supprimer des produits" ON produits;
CREATE POLICY "Admins peuvent supprimer des produits" ON produits
  FOR DELETE USING (true);

-- Policies cho commandes
DROP POLICY IF EXISTS "Insertion publique des commandes" ON commandes;
CREATE POLICY "Insertion publique des commandes" ON commandes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lecture publique des commandes par ID" ON commandes;
CREATE POLICY "Lecture publique des commandes par ID" ON commandes
  FOR SELECT USING (true);

-- Policies cho admins
DROP POLICY IF EXISTS "Aucun accès public aux admins" ON admins;
CREATE POLICY "Aucun accès public aux admins" ON admins
  FOR ALL USING (false);

-- Policies cho categories
DROP POLICY IF EXISTS "Les catégories actives sont visibles par tous" ON categories;
CREATE POLICY "Les catégories actives sont visibles par tous" ON categories
  FOR SELECT USING (active = true);

-- Policies cho settings
DROP POLICY IF EXISTS "Les settings sont visibles par tous" ON settings;
CREATE POLICY "Les settings sont visibles par tous" ON settings
  FOR SELECT USING (true);

-- Policies cho search_queries
DROP POLICY IF EXISTS "Allow public insert on search_queries" ON search_queries;
CREATE POLICY "Allow public insert on search_queries" ON search_queries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on search_queries" ON search_queries;
CREATE POLICY "Allow public read on search_queries" ON search_queries
  FOR SELECT USING (true);

-- ============================================
-- PART 6: Functions
-- ============================================

-- Function to decrement stock
CREATE OR REPLACE FUNCTION decrementer_stock(
  produit_id UUID,
  quantite INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE produits
  SET stock = stock - quantite
  WHERE id = produit_id;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update search vector
CREATE OR REPLACE FUNCTION produits_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('french', coalesce(NEW.nom, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(NEW.categorie, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to search products with full-text search
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
    (
      COALESCE(ts_rank(p.search_vector, tsquery_value), 0) * 2 +
      COALESCE(similarity(p.nom, search_query), 0) * 1.5 +
      COALESCE(similarity(p.description, search_query), 0) * 0.5
    )::REAL as rank
  FROM produits p
  WHERE 
    (
      p.search_vector @@ tsquery_value
      OR similarity(p.nom, search_query) > 0.2
      OR p.nom ILIKE '%' || search_query || '%'
      OR p.description ILIKE '%' || search_query || '%'
    )
    AND (category_filter IS NULL OR p.categorie = category_filter)
  ORDER BY rank DESC, p.date_ajout DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function get trending searches
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

-- Function get product suggestions
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

-- Function get category suggestions
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

-- ============================================
-- PART 7: Triggers
-- ============================================

-- Trigger to automatically update search_vector
DROP TRIGGER IF EXISTS produits_search_vector_trigger ON produits;
CREATE TRIGGER produits_search_vector_trigger
  BEFORE INSERT OR UPDATE OF nom, description, categorie ON produits
  FOR EACH ROW EXECUTE FUNCTION produits_search_vector_update();

-- ============================================
-- PART 8: Backfill search vectors
-- ============================================

-- Update search vectors cho các products hiện có
UPDATE produits SET search_vector = 
  setweight(to_tsvector('french', coalesce(nom, '')), 'A') ||
  setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('french', coalesce(categorie, '')), 'C')
WHERE search_vector IS NULL;

-- ============================================
-- PART 9: Realtime Configuration
-- ============================================

-- Tạo publication supabase_realtime nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
  END IF;
END $$;

-- Thêm table commandes vào publication realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'commandes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE commandes;
  END IF;
END $$;

-- Cấu hình REPLICA IDENTITY cho realtime
ALTER TABLE commandes REPLICA IDENTITY DEFAULT;

-- ============================================
-- PART 10: Storage Buckets (nếu chưa có)
-- ============================================

-- Tạo bucket produits-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'produits-images',
  'produits-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies cho produits-images
DROP POLICY IF EXISTS "Lecture publique des images produits" ON storage.objects;
CREATE POLICY "Lecture publique des images produits"
ON storage.objects
FOR SELECT
USING (bucket_id = 'produits-images');

DROP POLICY IF EXISTS "Insertion images produits" ON storage.objects;
CREATE POLICY "Insertion images produits"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'produits-images');

DROP POLICY IF EXISTS "Mise à jour images produits" ON storage.objects;
CREATE POLICY "Mise à jour images produits"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'produits-images')
WITH CHECK (bucket_id = 'produits-images');

DROP POLICY IF EXISTS "Suppression images produits" ON storage.objects;
CREATE POLICY "Suppression images produits"
ON storage.objects
FOR DELETE
USING (bucket_id = 'produits-images');

-- ============================================
-- PART 11: Default Data (Optional)
-- ============================================

-- Insert default categories (nếu chưa có)
INSERT INTO categories (nom, slug, description, ordre) VALUES
  ('Classiques', 'classiques', 'L''essence de l''élégance quotidienne. Nos modèles classiques allient tradition et modernité.', 1),
  ('Cuirs Exotiques', 'cuirs-exotiques', 'Le luxe dans sa forme la plus rare. Des cuirs précieux et exotiques pour des créations d''exception.', 2),
  ('Éditions Limitées', 'editions-limitees', 'Des pièces uniques pour les connaisseurs. Chaque édition limitée raconte une histoire unique.', 3),
  ('Nouveautés', 'nouveautes', 'Les dernières créations de nos ateliers. Découvrez nos nouveautés qui célèbrent l''innovation.', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert default settings (nếu chưa có)
INSERT INTO settings (id, email_entreprise, telephone, adresse, description)
VALUES (
  gen_random_uuid(),
  'contact@maisonslimani.com',
  '+212 5XX-XXXXXX',
  'Casablanca, Maroc',
  ''
)
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Notes:
-- 1. This script creates the complete schema, but does NOT import data
-- 2. To import data, export from old project and import via SQL Editor or Dashboard
-- 3. To migrate storage files, upload manually via Dashboard or use Supabase CLI
-- 4. After running this script, verify everything in Supabase Dashboard

