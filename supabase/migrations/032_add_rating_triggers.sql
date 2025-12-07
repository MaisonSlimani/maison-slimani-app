-- Migration: Additional rating calculation optimizations
-- This ensures rating calculations handle edge cases properly

-- Enhanced function to handle division by zero and null cases
CREATE OR REPLACE FUNCTION calculate_average_rating(p_produit_id UUID)
RETURNS NUMERIC(3,2) AS $$
DECLARE
  avg_rating NUMERIC(3,2);
BEGIN
  SELECT COALESCE(
    ROUND(AVG(rating)::NUMERIC, 2),
    0
  )
  INTO avg_rating
  FROM commentaires
  WHERE produit_id = p_produit_id
    AND approved = true;
  
  -- Return NULL if no approved comments exist (instead of 0)
  IF avg_rating = 0 THEN
    SELECT COUNT(*) INTO avg_rating
    FROM commentaires
    WHERE produit_id = p_produit_id
      AND approved = true;
    
    IF avg_rating = 0 THEN
      RETURN NULL;
    END IF;
  END IF;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enhanced update function to handle NULL properly
CREATE OR REPLACE FUNCTION update_produit_ratings()
RETURNS TRIGGER AS $$
DECLARE
  v_produit_id UUID;
  v_avg_rating NUMERIC(3,2);
  v_rating_count INTEGER;
BEGIN
  -- Determine which product_id to update
  IF TG_OP = 'DELETE' THEN
    v_produit_id := OLD.produit_id;
  ELSE
    v_produit_id := NEW.produit_id;
  END IF;

  -- Calculate new values
  v_avg_rating := calculate_average_rating(v_produit_id);
  v_rating_count := get_rating_count(v_produit_id);

  -- Update the product's rating fields atomically
  UPDATE produits
  SET 
    average_rating = v_avg_rating,
    rating_count = v_rating_count
  WHERE id = v_produit_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

