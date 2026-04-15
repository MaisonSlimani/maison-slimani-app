-- Migration 050: Fix Atomic Stock Functions for Color-Only Variations
-- The previous logic in 047 skipped color-only updates and fell back to root stock.

-- 1. Patch decrementer_stock_v2_atomic
CREATE OR REPLACE FUNCTION decrementer_stock_v2_atomic(
  p_product_id UUID,
  p_color_name TEXT,
  p_size_name TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_colors JSONB;
  v_current_sizes JSONB;
  v_color_idx INTEGER;
  v_size_idx INTEGER;
  v_stock INTEGER;
  v_updated JSONB;
BEGIN
  -- Row-level lock
  SELECT colors, sizes INTO v_current_colors, v_current_sizes 
  FROM produits WHERE id = p_product_id FOR UPDATE;

  -- CASE 1: Color + Size
  IF p_color_name IS NOT NULL AND p_size_name IS NOT NULL THEN
    SELECT i-1 INTO v_color_idx FROM jsonb_array_elements(v_current_colors) WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_color_name;
    IF v_color_idx IS NULL THEN RETURN FALSE; END IF;
    
    SELECT i-1 INTO v_size_idx FROM jsonb_array_elements(v_current_colors->v_color_idx->'sizes') WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_size_name;
    IF v_size_idx IS NULL THEN RETURN FALSE; END IF;

    v_stock := (v_current_colors->v_color_idx->'sizes'->v_size_idx->>'stock')::INTEGER;
    IF v_stock < p_quantity THEN RETURN FALSE; END IF;

    v_updated := jsonb_set(v_current_colors, ARRAY[v_color_idx::TEXT, 'sizes', v_size_idx::TEXT, 'stock'], to_jsonb(v_stock - p_quantity));
    UPDATE produits SET colors = v_updated WHERE id = p_product_id;
    RETURN TRUE;

  -- CASE 2: Color ONLY (Fix: Added missing logic)
  ELSIF p_color_name IS NOT NULL THEN
    SELECT i-1 INTO v_color_idx FROM jsonb_array_elements(v_current_colors) WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_color_name;
    IF v_color_idx IS NULL THEN RETURN FALSE; END IF;
    
    v_stock := (v_current_colors->v_color_idx->>'stock')::INTEGER;
    IF v_stock < p_quantity THEN RETURN FALSE; END IF;

    v_updated := jsonb_set(v_current_colors, ARRAY[v_color_idx::TEXT, 'stock'], to_jsonb(v_stock - p_quantity));
    UPDATE produits SET colors = v_updated WHERE id = p_product_id;
    RETURN TRUE;

  -- CASE 3: Size only (top-level sizes array)
  ELSIF p_size_name IS NOT NULL THEN
    SELECT i-1 INTO v_size_idx FROM jsonb_array_elements(v_current_sizes) WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_size_name;
    IF v_size_idx IS NULL THEN RETURN FALSE; END IF;

    v_stock := (v_current_sizes->v_size_idx->>'stock')::INTEGER;
    IF v_stock < p_quantity THEN RETURN FALSE; END IF;

    v_updated := jsonb_set(v_current_sizes, ARRAY[v_size_idx::TEXT, 'stock'], to_jsonb(v_stock - p_quantity));
    UPDATE produits SET sizes = v_updated WHERE id = p_product_id;
    RETURN TRUE;

  -- CASE 4: Simple product (root stock)
  ELSE
    UPDATE produits SET stock = stock - p_quantity WHERE id = p_product_id AND stock >= p_quantity;
    RETURN FOUND;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Patch incrementer_stock_v2_atomic
CREATE OR REPLACE FUNCTION incrementer_stock_v2_atomic(
  p_product_id UUID,
  p_color_name TEXT,
  p_size_name TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_colors JSONB;
  v_current_sizes JSONB;
  v_color_idx INTEGER;
  v_size_idx INTEGER;
  v_updated JSONB;
BEGIN
  SELECT colors, sizes INTO v_current_colors, v_current_sizes FROM produits WHERE id = p_product_id FOR UPDATE;

  -- CASE 1: Color + Size
  IF p_color_name IS NOT NULL AND p_size_name IS NOT NULL THEN
    SELECT i-1 INTO v_color_idx FROM jsonb_array_elements(v_current_colors) WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_color_name;
    IF v_color_idx IS NULL THEN RETURN FALSE; END IF;
    
    SELECT i-1 INTO v_size_idx FROM jsonb_array_elements(v_current_colors->v_color_idx->'sizes') WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_size_name;
    IF v_size_idx IS NULL THEN RETURN FALSE; END IF;

    v_updated := jsonb_set(v_current_colors, ARRAY[v_color_idx::TEXT, 'sizes', v_size_idx::TEXT, 'stock'], to_jsonb((v_current_colors->v_color_idx->'sizes'->v_size_idx->>'stock')::int + p_quantity));
    UPDATE produits SET colors = v_updated WHERE id = p_product_id;
    RETURN TRUE;

  -- CASE 2: Color ONLY (Fix: Added missing logic)
  ELSIF p_color_name IS NOT NULL THEN
    SELECT i-1 INTO v_color_idx FROM jsonb_array_elements(v_current_colors) WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_color_name;
    IF v_color_idx IS NULL THEN RETURN FALSE; END IF;

    v_updated := jsonb_set(v_current_colors, ARRAY[v_color_idx::TEXT, 'stock'], to_jsonb((v_current_colors->v_color_idx->>'stock')::int + p_quantity));
    UPDATE produits SET colors = v_updated WHERE id = p_product_id;
    RETURN TRUE;

  -- CASE 3: Size only
  ELSIF p_size_name IS NOT NULL THEN
    SELECT i-1 INTO v_size_idx FROM jsonb_array_elements(v_current_sizes) WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_size_name;
    IF v_size_idx IS NULL THEN RETURN FALSE; END IF;

    v_updated := jsonb_set(v_current_sizes, ARRAY[v_size_idx::TEXT, 'stock'], to_jsonb((v_current_sizes->v_size_idx->>'stock')::int + p_quantity));
    UPDATE produits SET sizes = v_updated WHERE id = p_product_id;
    RETURN TRUE;

  -- CASE 4: Simple product
  ELSE
    UPDATE produits SET stock = stock + p_quantity WHERE id = p_product_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
