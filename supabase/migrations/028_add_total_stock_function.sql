-- Performance optimization: Add total_stock column for efficient SQL-level filtering
-- This allows filtering products with colors in SQL instead of JavaScript post-processing

-- Step 1: Add total_stock column
ALTER TABLE produits 
ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 0;

-- Step 2: Function to calculate total stock
CREATE OR REPLACE FUNCTION calculate_total_stock(
  p_has_colors BOOLEAN,
  p_stock INTEGER,
  p_couleurs JSONB
)
RETURNS INTEGER AS $$
BEGIN
  -- If product has colors, sum stock from couleurs array
  IF p_has_colors = true AND p_couleurs IS NOT NULL AND jsonb_typeof(p_couleurs) = 'array' THEN
    RETURN (
      SELECT COALESCE(SUM((c->>'stock')::INTEGER), 0)
      FROM jsonb_array_elements(p_couleurs) AS c
    );
  ELSE
    -- For products without colors, return the main stock field
    RETURN COALESCE(p_stock, 0);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Trigger function to maintain total_stock
CREATE OR REPLACE FUNCTION update_total_stock()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_stock := calculate_total_stock(
    COALESCE(NEW.has_colors, false),
    COALESCE(NEW.stock, 0),
    NEW.couleurs
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to auto-update total_stock
DROP TRIGGER IF EXISTS trigger_update_total_stock ON produits;
CREATE TRIGGER trigger_update_total_stock
  BEFORE INSERT OR UPDATE OF stock, couleurs, has_colors ON produits
  FOR EACH ROW
  EXECUTE FUNCTION update_total_stock();

-- Step 5: Update existing products to calculate total_stock
UPDATE produits
SET total_stock = calculate_total_stock(
  COALESCE(has_colors, false),
  COALESCE(stock, 0),
  couleurs
);

-- Step 6: Add indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_produits_total_stock ON produits(total_stock) WHERE total_stock > 0;
CREATE INDEX IF NOT EXISTS idx_produits_has_colors ON produits(has_colors) WHERE has_colors = true;
CREATE INDEX IF NOT EXISTS idx_produits_stock ON produits(stock) WHERE has_colors = false AND stock > 0;

