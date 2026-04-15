-- Migration: Update order placement RPC to use English columns (v2)
-- Aligning with the new English schema for 'commandes' and 'produits'

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
  -- 1. Create the order using English columns
  INSERT INTO commandes (
    customer_name, 
    phone, 
    address, 
    city, 
    email, 
    items, 
    total, 
    status, 
    created_at
  ) VALUES (
    p_customer_name, 
    p_phone, 
    p_address, 
    p_city, 
    p_email, 
    p_items, 
    p_total, 
    'en_attente', 
    NOW()
  ) RETURNING id INTO v_order_id;

  -- 2. Optional: Loop through p_items to update p_stock
  -- This is a placeholder for your stock management logic
  -- FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  -- LOOP
  --   UPDATE produits SET stock = stock - (v_item->>'quantity')::int WHERE id = (v_item->>'id')::uuid;
  -- END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'data', (SELECT row_to_json(c) FROM (SELECT * FROM commandes WHERE id = v_order_id) c)
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
