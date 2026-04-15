-- Migration: Add idempotency and atomic order creation
-- 1. Add idempotency_key to commandes table
ALTER TABLE commandes ADD COLUMN IF NOT EXISTS idempotency_key UUID UNIQUE;

-- 2. Create the atomic order creation function
-- This function handles stock validation, stock decrement, and order insertion in one transaction.

CREATE OR REPLACE FUNCTION create_order_v2_atomic(
  p_nom_client TEXT,
  p_telephone TEXT,
  p_adresse TEXT,
  p_ville TEXT,
  p_email TEXT,
  p_produits JSONB, -- Array of {id, quantite, couleur, taille, prix, nom}
  p_total NUMERIC(10,2),
  p_idempotency_key UUID
)
RETURNS JSONB AS $$
DECLARE
  v_commande_id UUID;
  v_item JSONB;
  v_produit_id UUID;
  v_quantite INTEGER;
  v_couleur_nom TEXT;
  v_taille_nom TEXT;
  v_stock_ok BOOLEAN;
  v_result JSONB;
BEGIN
  -- 1. Check idempotency (prevent double orders)
  SELECT id INTO v_commande_id FROM commandes WHERE idempotency_key = p_idempotency_key;
  IF FOUND THEN
    SELECT jsonb_build_object('success', true, 'data', row_to_json(c)) INTO v_result 
    FROM commandes c WHERE id = v_commande_id;
    RETURN v_result;
  END IF;

  -- 2. Start Transaction implicitly via function call
  -- 3. Loop through products to validate and decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_produits)
  LOOP
    v_produit_id := (v_item->>'id')::UUID;
    v_quantite := (v_item->>'quantite')::INTEGER;
    v_couleur_nom := v_item->>'couleur';
    v_taille_nom := v_item->>'taille';

    -- Strategy: Use existing atomic decrement functions or implement inline
    -- If any decrement fails, the whole function transaction will rollback
    
    IF v_taille_nom IS NOT NULL THEN
      IF v_couleur_nom IS NOT NULL THEN
        -- Atomic decrement for color + size
        -- Note: We assume the existing 'decrementer_stock_couleur_taille_atomic' exists or we use similar logic
        -- Logic for color + size:
        IF NOT decrementer_stock_couleur_taille_atomic(v_produit_id, v_couleur_nom, v_taille_nom, v_quantite) THEN
          RAISE EXCEPTION 'Stock insuffisant pour le produit % (% - %)', v_produit_id, v_couleur_nom, v_taille_nom;
        END IF;
      ELSE
        -- Atomic decrement for size only
        IF NOT decrementer_stock_taille_atomic(v_produit_id, v_taille_nom, v_quantite) THEN
          RAISE EXCEPTION 'Stock insuffisant pour le produit % (Taille %)', v_produit_id, v_taille_nom;
        END IF;
      END IF;
    ELSE
      IF v_couleur_nom IS NOT NULL THEN
        -- Atomic decrement for color only
        IF NOT decrementer_stock_couleur_atomic(v_produit_id, v_couleur_nom, v_quantite) THEN
          RAISE EXCEPTION 'Stock insuffisant pour le produit % (%)', v_produit_id, v_couleur_nom;
        END IF;
      ELSE
        -- Atomic decrement for simple product
        IF NOT decrementer_stock_atomic(v_produit_id, v_quantite) THEN
          RAISE EXCEPTION 'Stock insuffisant pour le produit %', v_produit_id;
        END IF;
      END IF;
    END IF;
  END LOOP;

  -- 4. Insert the order
  INSERT INTO commandes (
    nom_client,
    telephone,
    adresse,
    ville,
    email,
    produits,
    total,
    idempotency_key,
    statut
  ) VALUES (
    p_nom_client,
    p_telephone,
    p_adresse,
    p_ville,
    p_email,
    p_produits,
    p_total,
    p_idempotency_key,
    'En attente'
  ) RETURNING id INTO v_commande_id;

  -- 5. Return success
  SELECT jsonb_build_object('success', true, 'data', row_to_json(c)) INTO v_result 
  FROM commandes c WHERE id = v_commande_id;
  
  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;
