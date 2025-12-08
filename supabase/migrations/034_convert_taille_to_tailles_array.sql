-- Migration: Convert taille (comma-separated string) to tailles (array of objects with stock per size)
-- This enables stock management per size and color combination

-- Step 1: Add tailles column to produits table for products without colors
ALTER TABLE produits 
ADD COLUMN IF NOT EXISTS tailles JSONB DEFAULT '[]'::jsonb;

-- Step 2: Function to convert comma-separated taille string to tailles array
-- For products without colors: distribute stock evenly across all sizes
CREATE OR REPLACE FUNCTION convert_taille_to_tailles(
  p_taille TEXT,
  p_stock INTEGER
)
RETURNS JSONB AS $$
DECLARE
  tailles_array JSONB := '[]'::jsonb;
  taille_list TEXT[];
  taille_item TEXT;
  stock_per_size INTEGER;
BEGIN
  -- If no taille, return empty array
  IF p_taille IS NULL OR TRIM(p_taille) = '' THEN
    RETURN tailles_array;
  END IF;

  -- Split comma-separated string into array
  taille_list := string_to_array(TRIM(p_taille), ',');
  
  -- Calculate stock per size (distribute evenly)
  IF array_length(taille_list, 1) > 0 THEN
    stock_per_size := COALESCE(p_stock, 0) / array_length(taille_list, 1);
  ELSE
    stock_per_size := COALESCE(p_stock, 0);
  END IF;

  -- Build tailles array with stock for each size
  FOREACH taille_item IN ARRAY taille_list
  LOOP
    taille_item := TRIM(taille_item);
    IF taille_item != '' THEN
      tailles_array := tailles_array || jsonb_build_object(
        'nom', taille_item,
        'stock', stock_per_size
      );
    END IF;
  END LOOP;

  RETURN tailles_array;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Function to convert taille in couleurs array to tailles array
-- For products with colors: distribute each color's stock evenly across its sizes
CREATE OR REPLACE FUNCTION convert_couleurs_taille_to_tailles(
  p_couleurs JSONB
)
RETURNS JSONB AS $$
DECLARE
  updated_couleurs JSONB;
  couleur JSONB;
  couleur_index INTEGER;
  taille_str TEXT;
  couleur_stock INTEGER;
  tailles_array JSONB;
  taille_list TEXT[];
  taille_item TEXT;
  stock_per_size INTEGER;
BEGIN
  -- If no couleurs, return as is
  IF p_couleurs IS NULL OR jsonb_typeof(p_couleurs) != 'array' THEN
    RETURN p_couleurs;
  END IF;

  updated_couleurs := p_couleurs;

  -- Process each color
  FOR couleur_index IN 0..jsonb_array_length(p_couleurs) - 1 LOOP
    couleur := p_couleurs->couleur_index;
    
    -- Get taille string and stock for this color
    taille_str := couleur->>'taille';
    couleur_stock := COALESCE((couleur->>'stock')::INTEGER, 0);

    -- Convert taille to tailles array
    tailles_array := '[]'::jsonb;
    
    IF taille_str IS NOT NULL AND TRIM(taille_str) != '' THEN
      -- Split comma-separated string
      taille_list := string_to_array(TRIM(taille_str), ',');
      
      -- Calculate stock per size (distribute evenly)
      IF array_length(taille_list, 1) > 0 THEN
        stock_per_size := couleur_stock / array_length(taille_list, 1);
      ELSE
        stock_per_size := couleur_stock;
      END IF;

      -- Build tailles array
      FOREACH taille_item IN ARRAY taille_list
      LOOP
        taille_item := TRIM(taille_item);
        IF taille_item != '' THEN
          tailles_array := tailles_array || jsonb_build_object(
            'nom', taille_item,
            'stock', stock_per_size
          );
        END IF;
      END LOOP;
    END IF;

    -- Update the color: add tailles, remove taille
    updated_couleurs := jsonb_set(
      updated_couleurs,
      ARRAY[couleur_index::TEXT, 'tailles'],
      tailles_array
    );
    updated_couleurs := updated_couleurs - 'taille';
  END LOOP;

  RETURN updated_couleurs;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 4: Migrate products WITHOUT colors (convert taille to tailles)
UPDATE produits
SET tailles = convert_taille_to_tailles(taille, stock)
WHERE has_colors = false OR has_colors IS NULL;

-- Step 5: Migrate products WITH colors (convert taille in couleurs to tailles)
UPDATE produits
SET couleurs = convert_couleurs_taille_to_tailles(couleurs)
WHERE has_colors = true AND couleurs IS NOT NULL;

-- Step 6: Update calculate_total_stock function to handle tailles arrays
CREATE OR REPLACE FUNCTION calculate_total_stock(
  p_has_colors BOOLEAN,
  p_stock INTEGER,
  p_couleurs JSONB,
  p_tailles JSONB
)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
  couleur JSONB;
  taille_obj JSONB;
BEGIN
  -- If product has colors, sum stock from tailles in couleurs array
  IF p_has_colors = true AND p_couleurs IS NOT NULL AND jsonb_typeof(p_couleurs) = 'array' THEN
    -- Sum stock from all tailles in all colors
    FOR couleur IN SELECT * FROM jsonb_array_elements(p_couleurs)
    LOOP
      -- Check if color has tailles array
      IF couleur ? 'tailles' AND jsonb_typeof(couleur->'tailles') = 'array' THEN
        -- Sum stock from all sizes in this color
        FOR taille_obj IN SELECT * FROM jsonb_array_elements(couleur->'tailles')
        LOOP
          total := total + COALESCE((taille_obj->>'stock')::INTEGER, 0);
        END LOOP;
      ELSIF couleur ? 'stock' THEN
        -- Fallback: use color stock if tailles not available (backward compatibility)
        total := total + COALESCE((couleur->>'stock')::INTEGER, 0);
      END IF;
    END LOOP;
  ELSE
    -- For products without colors, sum stock from product-level tailles array
    IF p_tailles IS NOT NULL AND jsonb_typeof(p_tailles) = 'array' THEN
      FOR taille_obj IN SELECT * FROM jsonb_array_elements(p_tailles)
      LOOP
        total := total + COALESCE((taille_obj->>'stock')::INTEGER, 0);
      END LOOP;
    ELSE
      -- Fallback: use main stock field if tailles not available (backward compatibility)
      total := COALESCE(p_stock, 0);
    END IF;
  END IF;

  RETURN total;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 7: Update trigger function to use new calculate_total_stock signature
CREATE OR REPLACE FUNCTION update_total_stock()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_stock := calculate_total_stock(
    COALESCE(NEW.has_colors, false),
    COALESCE(NEW.stock, 0),
    NEW.couleurs,
    NEW.tailles
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Update trigger to include tailles in the update list
DROP TRIGGER IF EXISTS trigger_update_total_stock ON produits;
CREATE TRIGGER trigger_update_total_stock
  BEFORE INSERT OR UPDATE OF stock, couleurs, has_colors, tailles ON produits
  FOR EACH ROW
  EXECUTE FUNCTION update_total_stock();

-- Step 9: Recalculate total_stock for all products
UPDATE produits
SET total_stock = calculate_total_stock(
  COALESCE(has_colors, false),
  COALESCE(stock, 0),
  couleurs,
  tailles
);

-- Step 10: Add index for tailles column
CREATE INDEX IF NOT EXISTS idx_produits_tailles ON produits USING GIN (tailles) WHERE tailles IS NOT NULL AND tailles != '[]'::jsonb;

