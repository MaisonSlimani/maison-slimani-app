-- Migration: Modernize Stock Functions and Enable Restocking Trigger
-- 1. Atomic Decrement for English Schema
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

  -- Logic for Color + Size
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

  -- Logic for Size only
  ELSIF p_size_name IS NOT NULL THEN
    SELECT i-1 INTO v_size_idx FROM jsonb_array_elements(v_current_sizes) WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_size_name;
    IF v_size_idx IS NULL THEN RETURN FALSE; END IF;

    v_stock := (v_current_sizes->v_size_idx->>'stock')::INTEGER;
    IF v_stock < p_quantity THEN RETURN FALSE; END IF;

    v_updated := jsonb_set(v_current_sizes, ARRAY[v_size_idx::TEXT, 'stock'], to_jsonb(v_stock - p_quantity));
    UPDATE produits SET sizes = v_updated WHERE id = p_product_id;
    RETURN TRUE;

  -- Logic for simple product (root stock)
  ELSE
    UPDATE produits SET stock = stock - p_quantity WHERE id = p_product_id AND stock >= p_quantity;
    RETURN FOUND;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atomic Increment for English Schema (Restocking)
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

  IF p_color_name IS NOT NULL AND p_size_name IS NOT NULL THEN
    SELECT i-1 INTO v_color_idx FROM jsonb_array_elements(v_current_colors) WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_color_name;
    IF v_color_idx IS NULL THEN RETURN FALSE; END IF;
    
    SELECT i-1 INTO v_size_idx FROM jsonb_array_elements(v_current_colors->v_color_idx->'sizes') WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_size_name;
    IF v_size_idx IS NULL THEN RETURN FALSE; END IF;

    v_updated := jsonb_set(v_current_colors, ARRAY[v_color_idx::TEXT, 'sizes', v_size_idx::TEXT, 'stock'], to_jsonb((v_current_colors->v_color_idx->'sizes'->v_size_idx->>'stock')::int + p_quantity));
    UPDATE produits SET colors = v_updated WHERE id = p_product_id;
    RETURN TRUE;

  ELSIF p_size_name IS NOT NULL THEN
    SELECT i-1 INTO v_size_idx FROM jsonb_array_elements(v_current_sizes) WITH ORDINALITY AS t(v, i) WHERE v->>'name' = p_size_name;
    IF v_size_idx IS NULL THEN RETURN FALSE; END IF;

    v_updated := jsonb_set(v_current_sizes, ARRAY[v_size_idx::TEXT, 'stock'], to_jsonb((v_current_sizes->v_size_idx->>'stock')::int + p_quantity));
    UPDATE produits SET sizes = v_updated WHERE id = p_product_id;
    RETURN TRUE;

  ELSE
    UPDATE produits SET stock = stock + p_quantity WHERE id = p_product_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Automatic Restocking Trigger
CREATE OR REPLACE FUNCTION handle_order_restocking()
RETURNS TRIGGER AS $$
DECLARE
  v_item JSONB;
BEGIN
  -- CASE 1: Order is DELETED
  -- If the order wasn't already cancelled, restore its stock
  IF (TG_OP = 'DELETE') THEN
    IF (OLD.status != 'annulee') THEN
      FOR v_item IN SELECT * FROM jsonb_array_elements(OLD.items)
      LOOP
        PERFORM incrementer_stock_v2_atomic(
          (v_item->>'id')::UUID,
          v_item->>'color',
          v_item->>'size',
          (v_item->>'quantity')::INTEGER
        );
      END LOOP;
    END IF;
    RETURN OLD;
  END IF;

  -- CASE 2: Order is UPDATED
  -- Case 2a: Transition TO 'annulee' -> Restore stock
  IF (NEW.status = 'annulee' AND (OLD.status IS NULL OR OLD.status != 'annulee')) THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      PERFORM incrementer_stock_v2_atomic(
        (v_item->>'id')::UUID,
        v_item->>'color',
        v_item->>'size',
        (v_item->>'quantity')::INTEGER
      );
    END LOOP;
  
  -- Case 2b: Move BACK from 'annulee' to active -> Decrease stock again
  ELSIF (OLD.status = 'annulee' AND NEW.status != 'annulee') THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      IF NOT decrementer_stock_v2_atomic(
        (v_item->>'id')::UUID,
        v_item->>'color',
        v_item->>'size',
        (v_item->>'quantity')::INTEGER
      ) THEN
        RAISE EXCEPTION 'Stock insuffisant pour restaurer la commande (%)', (v_item->>'name');
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_restock_on_move ON commandes;
CREATE TRIGGER trigger_restock_on_move
AFTER UPDATE OR DELETE ON commandes
FOR EACH ROW
EXECUTE FUNCTION handle_order_restocking();

-- 4. Re-enable decrement in create_order_v2_atomic
CREATE OR REPLACE FUNCTION create_order_v2_atomic(
  p_customer_name TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_city TEXT,
  p_email TEXT DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::JSONB,
  p_total NUMERIC DEFAULT 0,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_order_id FROM commandes WHERE idempotency_key = p_idempotency_key::UUID;
    IF FOUND THEN
      RETURN jsonb_build_object('success', true, 'data', (SELECT row_to_json(c) FROM (SELECT * FROM commandes WHERE id = v_order_id) c));
    END IF;
  END IF;

  -- 1. Decrement Stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF NOT decrementer_stock_v2_atomic(
      (v_item->>'id')::UUID,
      v_item->>'color',
      v_item->>'size',
      (v_item->>'quantity')::INTEGER
    ) THEN
      RAISE EXCEPTION 'Stock insuffisant pour le produit %', (v_item->>'name');
    END IF;
  END LOOP;

  -- 2. Create the order
  INSERT INTO commandes (
    customer_name, phone, address, city, email, items, total, status, idempotency_key, created_at
  ) VALUES (
    p_customer_name, p_phone, p_address, p_city, p_email, p_items, p_total, 'en_attente', p_idempotency_key::UUID, NOW()
  ) RETURNING id INTO v_order_id;

  RETURN jsonb_build_object('success', true, 'data', (SELECT row_to_json(c) FROM (SELECT * FROM commandes WHERE id = v_order_id) c));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
