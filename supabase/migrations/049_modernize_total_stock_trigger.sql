-- Migration 049: Modernize Total Stock Trigger for English Schema
-- This replaces legacy French column references (couleurs, tailles) with English (colors, sizes)

-- Step 0: Drop dependencies to allow reconfiguration
DROP TRIGGER IF EXISTS trigger_update_total_stock ON produits;
DROP FUNCTION IF EXISTS update_total_stock();
DROP FUNCTION IF EXISTS calculate_total_stock(BOOLEAN, INTEGER, JSONB, JSONB);

-- 1. Modernize calculate_total_stock function
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
  -- If product has colors, sum stock from sizes in colors array
  IF p_has_colors = true AND p_colors IS NOT NULL AND jsonb_typeof(p_colors) = 'array' THEN
    FOR color_obj IN SELECT * FROM jsonb_array_elements(p_colors)
    LOOP
      -- Check if color has sizes array (modern structure)
      IF color_obj ? 'sizes' AND jsonb_typeof(color_obj->'sizes') = 'array' THEN
        FOR size_obj IN SELECT * FROM jsonb_array_elements(color_obj->'sizes')
        LOOP
          total := total + COALESCE((size_obj->>'stock')::INTEGER, 0);
        END LOOP;
      ELSIF color_obj ? 'stock' THEN
        -- Fallback: use color stock (backward compatibility)
        total := total + COALESCE((color_obj->>'stock')::INTEGER, 0);
      END IF;
    END LOOP;
  ELSE
    -- For products without colors, sum stock from standalone sizes array
    IF p_sizes IS NOT NULL AND jsonb_typeof(p_sizes) = 'array' THEN
      FOR size_obj IN SELECT * FROM jsonb_array_elements(p_sizes)
      LOOP
        total := total + COALESCE((size_obj->>'stock')::INTEGER, 0);
      END LOOP;
    ELSE
      -- Fallback: use root stock field
      total := COALESCE(p_stock, 0);
    END IF;
  END IF;

  RETURN total;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Modernize update_total_stock trigger function
CREATE OR REPLACE FUNCTION update_total_stock()
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

-- 3. Re-create the trigger with English column references
DROP TRIGGER IF EXISTS trigger_update_total_stock ON produits;
CREATE TRIGGER trigger_update_total_stock
  BEFORE INSERT OR UPDATE OF stock, colors, has_colors, sizes ON produits
  FOR EACH ROW
  EXECUTE FUNCTION update_total_stock();
