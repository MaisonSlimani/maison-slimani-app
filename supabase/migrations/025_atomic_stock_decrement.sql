-- Atomic stock decrement functions to prevent race conditions
-- These functions check stock and decrement atomically in a single transaction

-- Function for products without colors
CREATE OR REPLACE FUNCTION decrementer_stock_atomic(
  produit_id UUID,
  quantite INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Lock the row and get current stock
  SELECT stock INTO current_stock
  FROM produits
  WHERE id = produit_id
  FOR UPDATE; -- Row-level lock prevents concurrent modifications

  -- Check if stock is sufficient
  IF current_stock IS NULL OR current_stock < quantite THEN
    RETURN FALSE;
  END IF;

  -- Decrement stock atomically
  UPDATE produits
  SET stock = stock - quantite
  WHERE id = produit_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function for products with colors
CREATE OR REPLACE FUNCTION decrementer_stock_couleur_atomic(
  produit_id UUID,
  couleur_nom TEXT,
  quantite INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_couleurs JSONB;
  couleur_index INTEGER;
  couleur_stock INTEGER;
  updated_couleurs JSONB;
BEGIN
  -- Lock the row and get current couleurs
  SELECT couleurs INTO current_couleurs
  FROM produits
  WHERE id = produit_id
  FOR UPDATE; -- Row-level lock prevents concurrent modifications

  -- Check if couleurs exists and is an array
  IF current_couleurs IS NULL OR jsonb_typeof(current_couleurs) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Find the color index
  couleur_index := -1;
  FOR i IN 0..jsonb_array_length(current_couleurs) - 1 LOOP
    IF (current_couleurs->i->>'nom') = couleur_nom THEN
      couleur_index := i;
      EXIT;
    END IF;
  END LOOP;

  IF couleur_index = -1 THEN
    RETURN FALSE; -- Color not found
  END IF;

  -- Get current stock for this color
  couleur_stock := (current_couleurs->couleur_index->>'stock')::INTEGER;

  -- Check if stock is sufficient
  IF couleur_stock IS NULL OR couleur_stock < quantite THEN
    RETURN FALSE;
  END IF;

  -- Update the color's stock
  updated_couleurs := current_couleurs;
  updated_couleurs := jsonb_set(
    updated_couleurs,
    ARRAY[couleur_index::TEXT, 'stock'],
    to_jsonb(couleur_stock - quantite)
  );

  -- Update the product
  UPDATE produits
  SET couleurs = updated_couleurs
  WHERE id = produit_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update the old decrementer_stock function to use atomic version
CREATE OR REPLACE FUNCTION decrementer_stock(
  produit_id UUID,
  quantite INTEGER
)
RETURNS VOID AS $$
BEGIN
  IF NOT decrementer_stock_atomic(produit_id, quantite) THEN
    RAISE EXCEPTION 'Stock insuffisant pour le produit %', produit_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

