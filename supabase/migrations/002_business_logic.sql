-- 002_business_logic.sql: Inventory & Order Automation
-- Consolidates all stock triggers and atomic handling.

--------------------------------------------------------------------------------
-- 1. TOTAL STOCK MANAGEMENT
--------------------------------------------------------------------------------

-- Calculates total stock across single stock, sizes, or nested color-sizes
CREATE OR REPLACE FUNCTION calculate_total_stock(
  p_has_colors BOOLEAN,
  p_stock INTEGER,
  p_colors JSONB,
  p_sizes JSONB
)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
  color_obj JSONB;
  size_obj JSONB;
BEGIN
  IF p_has_colors = true AND p_colors IS NOT NULL AND jsonb_typeof(p_colors) = 'array' THEN
    FOR color_obj IN SELECT * FROM jsonb_array_elements(p_colors)
    LOOP
      IF color_obj ? 'sizes' AND jsonb_typeof(color_obj->'sizes') = 'array' THEN
        FOR size_obj IN SELECT * FROM jsonb_array_elements(color_obj->'sizes')
        LOOP
          total := total + COALESCE((size_obj->>'stock')::INTEGER, 0);
        END LOOP;
      ELSE
        total := total + COALESCE((color_obj->>'stock')::INTEGER, 0);
      END IF;
    END LOOP;
  ELSIF p_sizes IS NOT NULL AND jsonb_typeof(p_sizes) = 'array' AND jsonb_array_length(p_sizes) > 0 THEN
    FOR size_obj IN SELECT * FROM jsonb_array_elements(p_sizes)
    LOOP
      total := total + COALESCE((size_obj->>'stock')::INTEGER, 0);
    END LOOP;
  ELSE
    total := COALESCE(p_stock, 0);
  END IF;
  RETURN total;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_total_stock_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_stock := calculate_total_stock(
    COALESCE(NEW.has_colors, false),
    COALESCE(NEW.stock, 0),
    NEW.colors,
    NEW.sizes
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_total_stock ON produits;
CREATE TRIGGER trigger_update_total_stock
  BEFORE INSERT OR UPDATE OF stock, colors, has_colors, sizes ON produits
  FOR EACH ROW
  EXECUTE FUNCTION update_total_stock_trigger_fn();

--------------------------------------------------------------------------------
-- 2. ATOMIC INVENTORY MANIPULATION
--------------------------------------------------------------------------------

-- DECREMENT HELPER
CREATE OR REPLACE FUNCTION decrement_product_stock_atomic(
  p_product_id UUID,
  p_quantity INTEGER,
  p_color_name TEXT DEFAULT NULL,
  p_size_name TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_colors JSONB;
  v_sizes JSONB;
  v_stock INTEGER;
  v_c_idx INTEGER;
  v_s_idx INTEGER;
  v_current_stock INTEGER;
BEGIN
  SELECT colors, sizes, stock INTO v_colors, v_sizes, v_stock
  FROM produits WHERE id = p_product_id FOR UPDATE;

  IF p_color_name IS NOT NULL AND p_size_name IS NOT NULL THEN
    SELECT (idx - 1) INTO v_c_idx FROM jsonb_array_elements(v_colors) WITH ORDINALITY AS t(val, idx) WHERE val->>'name' = p_color_name;
    IF v_c_idx IS NULL THEN RETURN FALSE; END IF;
    
    SELECT (idx - 1) INTO v_s_idx FROM jsonb_array_elements(v_colors->v_c_idx->'sizes') WITH ORDINALITY AS t(val, idx) WHERE val->>'name' = p_size_name;
    IF v_s_idx IS NULL THEN RETURN FALSE; END IF;

    v_current_stock := (v_colors->v_c_idx->'sizes'->v_s_idx->>'stock')::INT;
    IF v_current_stock < p_quantity THEN RETURN FALSE; END IF;

    UPDATE produits SET colors = jsonb_set(colors, ARRAY[v_c_idx::TEXT, 'sizes', v_s_idx::TEXT, 'stock'], to_jsonb(v_current_stock - p_quantity)) WHERE id = p_product_id;
  ELSIF p_size_name IS NOT NULL THEN
    SELECT (idx - 1) INTO v_s_idx FROM jsonb_array_elements(v_sizes) WITH ORDINALITY AS t(val, idx) WHERE val->>'name' = p_size_name;
    IF v_s_idx IS NULL THEN RETURN FALSE; END IF;

    v_current_stock := (v_sizes->v_s_idx->>'stock')::INT;
    IF v_current_stock < p_quantity THEN RETURN FALSE; END IF;

    UPDATE produits SET sizes = jsonb_set(sizes, ARRAY[v_s_idx::TEXT, 'stock'], to_jsonb(v_current_stock - p_quantity)) WHERE id = p_product_id;
  ELSE
    IF v_stock < p_quantity THEN RETURN FALSE; END IF;
    UPDATE produits SET stock = v_stock - p_quantity WHERE id = p_product_id;
  END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- INCREMENT HELPER (RESTOCK)
CREATE OR REPLACE FUNCTION increment_product_stock_atomic(
  p_product_id UUID,
  p_quantity INTEGER,
  p_color_name TEXT DEFAULT NULL,
  p_size_name TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_colors JSONB;
  v_sizes JSONB;
  v_stock INTEGER;
  v_c_idx INTEGER;
  v_s_idx INTEGER;
  v_current_stock INTEGER;
BEGIN
  SELECT colors, sizes, stock INTO v_colors, v_sizes, v_stock
  FROM produits WHERE id = p_product_id FOR UPDATE;

  IF p_color_name IS NOT NULL AND p_size_name IS NOT NULL THEN
    SELECT (idx - 1) INTO v_c_idx FROM jsonb_array_elements(v_colors) WITH ORDINALITY AS t(val, idx) WHERE val->>'name' = p_color_name;
    IF v_c_idx IS NULL THEN RETURN FALSE; END IF;
    
    SELECT (idx - 1) INTO v_s_idx FROM jsonb_array_elements(v_colors->v_c_idx->'sizes') WITH ORDINALITY AS t(val, idx) WHERE val->>'name' = p_size_name;
    IF v_s_idx IS NULL THEN RETURN FALSE; END IF;

    v_current_stock := (v_colors->v_c_idx->'sizes'->v_s_idx->>'stock')::INT;
    UPDATE produits SET colors = jsonb_set(colors, ARRAY[v_c_idx::TEXT, 'sizes', v_s_idx::TEXT, 'stock'], to_jsonb(v_current_stock + p_quantity)) WHERE id = p_product_id;
  ELSIF p_size_name IS NOT NULL THEN
    SELECT (idx - 1) INTO v_s_idx FROM jsonb_array_elements(v_sizes) WITH ORDINALITY AS t(val, idx) WHERE val->>'name' = p_size_name;
    IF v_s_idx IS NULL THEN RETURN FALSE; END IF;

    v_current_stock := (v_sizes->v_s_idx->>'stock')::INT;
    UPDATE produits SET sizes = jsonb_set(sizes, ARRAY[v_s_idx::TEXT, 'stock'], to_jsonb(v_current_stock + p_quantity)) WHERE id = p_product_id;
  ELSE
    UPDATE produits SET stock = COALESCE(v_stock, 0) + p_quantity WHERE id = p_product_id;
  END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- 3. ORDER PLACEMENT RPC
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION create_order_v2_atomic(
  p_customer_name TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_city TEXT,
  p_email TEXT,
  p_items JSONB,
  p_total NUMERIC,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  INSERT INTO commandes (customer_name, phone, email, address, city, items, total, status, idempotency_key)
  VALUES (p_customer_name, p_phone, p_email, p_address, p_city, p_items, p_total, 'en_attente', p_idempotency_key)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF NOT decrement_product_stock_atomic(
      (v_item->>'id')::UUID,
      (v_item->>'quantity')::INT,
      v_item->>'color',
      v_item->>'size'
    ) THEN
      RAISE EXCEPTION 'Stock insuffisant pour %', (v_item->>'name');
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'data', (SELECT row_to_json(c) FROM (SELECT * FROM commandes WHERE id = v_order_id) c));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- 4. RESTOCK ON CANCEL TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
  v_item JSONB;
BEGIN
  IF NEW.status = 'annulee' AND OLD.status != 'annulee' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      PERFORM increment_product_stock_atomic(
        (v_item->>'id')::UUID,
        (v_item->>'quantity')::INT,
        v_item->>'color',
        v_item->>'size'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_restock_on_cancel ON commandes;
CREATE TRIGGER trigger_restock_on_cancel
  AFTER UPDATE OF status ON commandes
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cancel();

--------------------------------------------------------------------------------
-- 5. RATING AGGREGATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE produits
  SET 
    rating = COALESCE((SELECT AVG(rating)::NUMERIC(2,1) FROM commentaires WHERE product_id = NEW.product_id AND status = 'approuve'), 5.0),
    rating_count = (SELECT COUNT(*) FROM commentaires WHERE product_id = NEW.product_id AND status = 'approuve')
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_rating ON commentaires;
CREATE TRIGGER trigger_update_rating
  AFTER INSERT OR UPDATE OF status OR DELETE ON commentaires
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();
