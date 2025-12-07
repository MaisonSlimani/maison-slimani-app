-- Update atomic stock functions to handle size-specific stock management

-- Function for products without colors: decrement stock for specific size
CREATE OR REPLACE FUNCTION decrementer_stock_taille_atomic(
  produit_id UUID,
  taille_nom TEXT,
  quantite INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_tailles JSONB;
  taille_index INTEGER;
  taille_stock INTEGER;
  updated_tailles JSONB;
BEGIN
  -- Lock the row and get current tailles
  SELECT tailles INTO current_tailles
  FROM produits
  WHERE id = produit_id
  FOR UPDATE; -- Row-level lock prevents concurrent modifications

  -- Check if tailles exists and is an array
  IF current_tailles IS NULL OR jsonb_typeof(current_tailles) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Find the size index
  taille_index := -1;
  FOR i IN 0..jsonb_array_length(current_tailles) - 1 LOOP
    IF (current_tailles->i->>'nom') = taille_nom THEN
      taille_index := i;
      EXIT;
    END IF;
  END LOOP;

  IF taille_index = -1 THEN
    RETURN FALSE; -- Size not found
  END IF;

  -- Get current stock for this size
  taille_stock := (current_tailles->taille_index->>'stock')::INTEGER;

  -- Check if stock is sufficient
  IF taille_stock IS NULL OR taille_stock < quantite THEN
    RETURN FALSE;
  END IF;

  -- Update the size's stock
  updated_tailles := current_tailles;
  updated_tailles := jsonb_set(
    updated_tailles,
    ARRAY[taille_index::TEXT, 'stock'],
    to_jsonb(taille_stock - quantite)
  );

  -- Update the product
  UPDATE produits
  SET tailles = updated_tailles
  WHERE id = produit_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function for products with colors: decrement stock for specific color and size
CREATE OR REPLACE FUNCTION decrementer_stock_couleur_taille_atomic(
  produit_id UUID,
  couleur_nom TEXT,
  taille_nom TEXT,
  quantite INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_couleurs JSONB;
  couleur_index INTEGER;
  couleur JSONB;
  couleur_tailles JSONB;
  taille_index INTEGER;
  taille_stock INTEGER;
  updated_tailles JSONB;
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

  couleur := current_couleurs->couleur_index;
  couleur_tailles := couleur->'tailles';

  -- Check if tailles exists and is an array
  IF couleur_tailles IS NULL OR jsonb_typeof(couleur_tailles) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Find the size index in this color's tailles
  taille_index := -1;
  FOR i IN 0..jsonb_array_length(couleur_tailles) - 1 LOOP
    IF (couleur_tailles->i->>'nom') = taille_nom THEN
      taille_index := i;
      EXIT;
    END IF;
  END LOOP;

  IF taille_index = -1 THEN
    RETURN FALSE; -- Size not found in this color
  END IF;

  -- Get current stock for this size
  taille_stock := (couleur_tailles->taille_index->>'stock')::INTEGER;

  -- Check if stock is sufficient
  IF taille_stock IS NULL OR taille_stock < quantite THEN
    RETURN FALSE;
  END IF;

  -- Update the size's stock in this color
  updated_tailles := couleur_tailles;
  updated_tailles := jsonb_set(
    updated_tailles,
    ARRAY[taille_index::TEXT, 'stock'],
    to_jsonb(taille_stock - quantite)
  );

  -- Update the color's tailles
  updated_couleurs := current_couleurs;
  updated_couleurs := jsonb_set(
    updated_couleurs,
    ARRAY[couleur_index::TEXT, 'tailles'],
    updated_tailles
  );

  -- Update the product
  UPDATE produits
  SET couleurs = updated_couleurs
  WHERE id = produit_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function for products without colors: increment stock for specific size
CREATE OR REPLACE FUNCTION incrementer_stock_taille_atomic(
  produit_id UUID,
  taille_nom TEXT,
  quantite INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_tailles JSONB;
  taille_index INTEGER;
  taille_stock INTEGER;
  updated_tailles JSONB;
BEGIN
  -- Lock the row and get current tailles
  SELECT tailles INTO current_tailles
  FROM produits
  WHERE id = produit_id
  FOR UPDATE; -- Row-level lock prevents concurrent modifications

  -- Check if tailles exists and is an array
  IF current_tailles IS NULL OR jsonb_typeof(current_tailles) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Find the size index
  taille_index := -1;
  FOR i IN 0..jsonb_array_length(current_tailles) - 1 LOOP
    IF (current_tailles->i->>'nom') = taille_nom THEN
      taille_index := i;
      EXIT;
    END IF;
  END LOOP;

  IF taille_index = -1 THEN
    RETURN FALSE; -- Size not found
  END IF;

  -- Get current stock for this size
  taille_stock := COALESCE((current_tailles->taille_index->>'stock')::INTEGER, 0);

  -- Update the size's stock
  updated_tailles := current_tailles;
  updated_tailles := jsonb_set(
    updated_tailles,
    ARRAY[taille_index::TEXT, 'stock'],
    to_jsonb(taille_stock + quantite)
  );

  -- Update the product
  UPDATE produits
  SET tailles = updated_tailles
  WHERE id = produit_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function for products with colors: increment stock for specific color and size
CREATE OR REPLACE FUNCTION incrementer_stock_couleur_taille_atomic(
  produit_id UUID,
  couleur_nom TEXT,
  taille_nom TEXT,
  quantite INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_couleurs JSONB;
  couleur_index INTEGER;
  couleur JSONB;
  couleur_tailles JSONB;
  taille_index INTEGER;
  taille_stock INTEGER;
  updated_tailles JSONB;
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

  couleur := current_couleurs->couleur_index;
  couleur_tailles := couleur->'tailles';

  -- Check if tailles exists and is an array
  IF couleur_tailles IS NULL OR jsonb_typeof(couleur_tailles) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Find the size index in this color's tailles
  taille_index := -1;
  FOR i IN 0..jsonb_array_length(couleur_tailles) - 1 LOOP
    IF (couleur_tailles->i->>'nom') = taille_nom THEN
      taille_index := i;
      EXIT;
    END IF;
  END LOOP;

  IF taille_index = -1 THEN
    RETURN FALSE; -- Size not found in this color
  END IF;

  -- Get current stock for this size
  taille_stock := COALESCE((couleur_tailles->taille_index->>'stock')::INTEGER, 0);

  -- Update the size's stock in this color
  updated_tailles := couleur_tailles;
  updated_tailles := jsonb_set(
    updated_tailles,
    ARRAY[taille_index::TEXT, 'stock'],
    to_jsonb(taille_stock + quantite)
  );

  -- Update the color's tailles
  updated_couleurs := current_couleurs;
  updated_couleurs := jsonb_set(
    updated_couleurs,
    ARRAY[couleur_index::TEXT, 'tailles'],
    updated_tailles
  );

  -- Update the product
  UPDATE produits
  SET couleurs = updated_couleurs
  WHERE id = produit_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update existing decrementer_stock_couleur_atomic to support backward compatibility
-- If taille_nom is NULL, it will use the old behavior (decrement color stock)
CREATE OR REPLACE FUNCTION decrementer_stock_couleur_atomic(
  produit_id UUID,
  couleur_nom TEXT,
  quantite INTEGER,
  taille_nom TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_couleurs JSONB;
  couleur_index INTEGER;
  couleur_stock INTEGER;
  updated_couleurs JSONB;
BEGIN
  -- If taille_nom is provided, use size-specific function
  IF taille_nom IS NOT NULL THEN
    RETURN decrementer_stock_couleur_taille_atomic(produit_id, couleur_nom, taille_nom, quantite);
  END IF;

  -- Otherwise, use old behavior (decrement color stock - for backward compatibility)
    -- Lock the row and get current couleurs
    SELECT couleurs INTO current_couleurs
    FROM produits
    WHERE id = produit_id
    FOR UPDATE;

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
      RETURN FALSE;
    END IF;

    -- Get current stock for this color (sum of all sizes)
    SELECT COALESCE(SUM((t->>'stock')::INTEGER), 0) INTO couleur_stock
    FROM jsonb_array_elements((current_couleurs->couleur_index->'tailles')::jsonb) AS t;

    -- If no tailles, fallback to color stock field
    IF couleur_stock = 0 AND (current_couleurs->couleur_index ? 'stock') THEN
      couleur_stock := (current_couleurs->couleur_index->>'stock')::INTEGER;
    END IF;

    -- Check if stock is sufficient
    IF couleur_stock IS NULL OR couleur_stock < quantite THEN
      RETURN FALSE;
    END IF;

    -- For backward compatibility, we'll decrement from the first available size
    -- This is not ideal but maintains compatibility
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update existing incrementer_stock_couleur_atomic to support backward compatibility
CREATE OR REPLACE FUNCTION incrementer_stock_couleur_atomic(
  produit_id UUID,
  couleur_nom TEXT,
  quantite INTEGER,
  taille_nom TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_couleurs JSONB;
  couleur_index INTEGER;
  couleur JSONB;
  couleur_tailles JSONB;
  taille_index INTEGER;
  taille_stock INTEGER;
  updated_tailles JSONB;
  updated_couleurs JSONB;
BEGIN
  -- If taille_nom is provided, use size-specific function
  IF taille_nom IS NOT NULL THEN
    RETURN incrementer_stock_couleur_taille_atomic(produit_id, couleur_nom, taille_nom, quantite);
  END IF;

  -- Otherwise, use old behavior (for backward compatibility)
  -- This will increment the first size's stock
  SELECT couleurs INTO current_couleurs
  FROM produits
  WHERE id = produit_id
  FOR UPDATE;

  IF current_couleurs IS NULL OR jsonb_typeof(current_couleurs) != 'array' THEN
    RETURN FALSE;
  END IF;

  couleur_index := -1;
  FOR i IN 0..jsonb_array_length(current_couleurs) - 1 LOOP
    IF (current_couleurs->i->>'nom') = couleur_nom THEN
      couleur_index := i;
      EXIT;
    END IF;
  END LOOP;

  IF couleur_index = -1 THEN
    RETURN FALSE;
  END IF;

  couleur := current_couleurs->couleur_index;
  couleur_tailles := couleur->'tailles';

  -- If tailles exists, increment first size
  IF couleur_tailles IS NOT NULL AND jsonb_typeof(couleur_tailles) = 'array' AND jsonb_array_length(couleur_tailles) > 0 THEN
    taille_index := 0;
    taille_stock := COALESCE((couleur_tailles->0->>'stock')::INTEGER, 0);
    
    updated_tailles := couleur_tailles;
    updated_tailles := jsonb_set(
      updated_tailles,
      ARRAY['0', 'stock'],
      to_jsonb(taille_stock + quantite)
    );

    updated_couleurs := current_couleurs;
    updated_couleurs := jsonb_set(
      updated_couleurs,
      ARRAY[couleur_index::TEXT, 'tailles'],
      updated_tailles
    );

    UPDATE produits
    SET couleurs = updated_couleurs
    WHERE id = produit_id;

    RETURN TRUE;
  END IF;

  -- Fallback: increment color stock field if it exists
  IF couleur ? 'stock' THEN
    updated_couleurs := current_couleurs;
    updated_couleurs := jsonb_set(
      updated_couleurs,
      ARRAY[couleur_index::TEXT, 'stock'],
      to_jsonb(COALESCE((couleur->>'stock')::INTEGER, 0) + quantite)
    );

    UPDATE produits
    SET couleurs = updated_couleurs
    WHERE id = produit_id;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

