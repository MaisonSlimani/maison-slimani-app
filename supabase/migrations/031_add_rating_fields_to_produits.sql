-- Migration: Add rating fields to produits table
-- This adds average_rating and rating_count columns that are automatically updated

-- Add rating columns
ALTER TABLE produits 
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Index for sorting by rating
CREATE INDEX IF NOT EXISTS idx_produits_average_rating ON produits(average_rating DESC NULLS LAST) WHERE average_rating IS NOT NULL;

-- Function to update product ratings
CREATE OR REPLACE FUNCTION update_produit_ratings()
RETURNS TRIGGER AS $$
DECLARE
  v_produit_id UUID;
BEGIN
  -- Determine which product_id to update
  IF TG_OP = 'DELETE' THEN
    v_produit_id := OLD.produit_id;
  ELSE
    v_produit_id := NEW.produit_id;
  END IF;

  -- Update the product's rating fields
  UPDATE produits
  SET 
    average_rating = calculate_average_rating(v_produit_id),
    rating_count = get_rating_count(v_produit_id)
  WHERE id = v_produit_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings when comment is inserted
CREATE TRIGGER trigger_update_ratings_on_insert
  AFTER INSERT ON commentaires
  FOR EACH ROW
  WHEN (NEW.approved = true)
  EXECUTE FUNCTION update_produit_ratings();

-- Trigger to update ratings when comment is updated
CREATE TRIGGER trigger_update_ratings_on_update
  AFTER UPDATE ON commentaires
  FOR EACH ROW
  WHEN (OLD.approved IS DISTINCT FROM NEW.approved OR OLD.rating IS DISTINCT FROM NEW.rating)
  EXECUTE FUNCTION update_produit_ratings();

-- Trigger to update ratings when comment is deleted
CREATE TRIGGER trigger_update_ratings_on_delete
  AFTER DELETE ON commentaires
  FOR EACH ROW
  WHEN (OLD.approved = true)
  EXECUTE FUNCTION update_produit_ratings();

-- Update existing products with their current ratings
UPDATE produits
SET 
  average_rating = calculate_average_rating(id),
  rating_count = get_rating_count(id);

-- Comments
COMMENT ON COLUMN produits.average_rating IS 'Average rating (1-5) calculated from approved comments';
COMMENT ON COLUMN produits.rating_count IS 'Total number of approved comments/ratings';

