-- Migration: Update search_products RPC to use English columns
-- This is a re-creation of the search function to match Rename Columns migration

CREATE OR REPLACE FUNCTION search_products(
  p_search TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_featured BOOLEAN DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'desc',
  p_limit INTEGER DEFAULT 12,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  stock INTEGER,
  total_stock INTEGER,
  image_url TEXT,
  images JSONB,
  category TEXT,
  featured BOOLEAN,
  has_colors BOOLEAN,
  colors JSONB,
  sizes JSONB,
  size TEXT,
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_products AS (
    SELECT 
      p.*,
      COUNT(*) OVER() as full_count
    FROM produits p
    WHERE 
      (p_search IS NULL OR 
       p.name ILIKE '%' || p_search || '%' OR 
       p.description ILIKE '%' || p_search || '%')
      AND (p_category IS NULL OR p.category = p_category)
      AND (p_featured IS NULL OR p.featured = p_featured)
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
  )
  SELECT 
    f.id, f.name, f.description, f.price, f.stock, f.total_stock,
    f.image_url, f.images, f.category, f.featured, f.has_colors,
    f.colors, f.sizes, f.size, f.slug, f.created_at,
    f.full_count
  FROM filtered_products f
  ORDER BY 
    CASE WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN f.price END ASC,
    CASE WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN f.price END DESC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN f.created_at END ASC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN f.created_at END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
