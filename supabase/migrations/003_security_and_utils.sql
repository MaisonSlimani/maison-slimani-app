-- 03_security_and_utils.sql: Security Hardening & Discovery RPCs

--------------------------------------------------------------------------------
-- 1. ROW LEVEL SECURITY (RLS)
--------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ACCESS
CREATE POLICY "Public Read Settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Products" ON produits FOR SELECT USING (true);
CREATE POLICY "Public Read Approved Comments" ON commentaires FOR SELECT USING (status = 'approuve');

-- STORAGE POLICIES
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING (bucket_id = 'produits');
CREATE POLICY "Public Access Categories" ON storage.objects FOR SELECT USING (bucket_id = 'categories');

CREATE POLICY "Admin Upload Products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'produits' AND (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')));
CREATE POLICY "Admin Update Products" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'produits' AND (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')));
CREATE POLICY "Admin Delete Products" ON storage.objects FOR DELETE USING (bucket_id = 'produits' AND (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')));

CREATE POLICY "Admin Full Access Categories Storage" ON storage.objects FOR ALL USING (bucket_id = 'categories' AND (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')));

-- CUSTOMER ACCESS
CREATE POLICY "Customers can insert orders" ON commandes FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can insert comments" ON commentaires FOR INSERT WITH CHECK (true);

-- ADMIN ACCESS (Full control via email check)
CREATE POLICY "Admin Full Access Settings" ON settings ALL USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));
CREATE POLICY "Admin Full Access Categories" ON categories ALL USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));
CREATE POLICY "Admin Full Access Products" ON produits ALL USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));
CREATE POLICY "Admin Full Access Orders" ON commandes ALL USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));
CREATE POLICY "Admin Full Access Comments" ON commentaires ALL USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));

--------------------------------------------------------------------------------
-- 2. DISCOVERY RPCs
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_products(
  p_search TEXT,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 12,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, name TEXT, slug TEXT, price NUMERIC, image_url TEXT, category TEXT, total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.name, p.slug, p.price, p.image_url, p.category,
    COUNT(*) OVER() as total_count
  FROM produits p
  WHERE (p_search IS NULL OR p.name ILIKE '%' || p_search || '%' OR p.description ILIKE '%' || p_search || '%')
    AND (p_category IS NULL OR p.category = p_category)
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_similar_products(p_product_id UUID, p_limit INTEGER DEFAULT 4)
RETURNS SETOF produits AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM produits
  WHERE category = (SELECT category FROM produits WHERE id = p_product_id)
    AND id != p_product_id
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_trending_searches(p_limit INTEGER DEFAULT 5)
RETURNS TABLE (query TEXT, search_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT s.query, s.search_count
  FROM search_queries s
  ORDER BY s.search_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_suggestions(p_prefix TEXT, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (id UUID, name TEXT, slug TEXT, image_url TEXT) AS $$
BEGIN
  -- Record the search query or increment count
  INSERT INTO search_queries (query, search_count)
  VALUES (LOWER(TRIM(p_prefix)), 1)
  ON CONFLICT (query) DO UPDATE
  SET search_count = search_queries.search_count + 1;

  RETURN QUERY
  SELECT p.id, p.name, p.slug, p.image_url
  FROM produits p
  WHERE p.name ILIKE p_prefix || '%'
     OR p.slug ILIKE p_prefix || '%'
  ORDER BY p.featured DESC, p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
