-- Migration: Create commentaires table for product reviews and ratings
-- This table stores user comments and ratings for products

CREATE TABLE IF NOT EXISTS commentaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  commentaire TEXT NOT NULL,
  session_token TEXT NOT NULL,
  flagged BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_commentaires_produit_id ON commentaires(produit_id);
CREATE INDEX IF NOT EXISTS idx_commentaires_created_at ON commentaires(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commentaires_flagged ON commentaires(flagged) WHERE flagged = true;
CREATE INDEX IF NOT EXISTS idx_commentaires_approved ON commentaires(approved) WHERE approved = true;
CREATE INDEX IF NOT EXISTS idx_commentaires_session_token ON commentaires(session_token);

-- Function to calculate average rating for a product
CREATE OR REPLACE FUNCTION calculate_average_rating(p_produit_id UUID)
RETURNS NUMERIC(3,2) AS $$
DECLARE
  avg_rating NUMERIC(3,2);
BEGIN
  SELECT COALESCE(AVG(rating)::NUMERIC(3,2), 0)
  INTO avg_rating
  FROM commentaires
  WHERE produit_id = p_produit_id
    AND approved = true;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get rating count for a product
CREATE OR REPLACE FUNCTION get_rating_count(p_produit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count_rating INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO count_rating
  FROM commentaires
  WHERE produit_id = p_produit_id
    AND approved = true;
  
  RETURN count_rating;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_commentaires_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_commentaires_updated_at
  BEFORE UPDATE ON commentaires
  FOR EACH ROW
  EXECUTE FUNCTION update_commentaires_updated_at();

-- Enable Row Level Security
ALTER TABLE commentaires ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read approved comments
CREATE POLICY "Les commentaires approuvés sont visibles par tous" ON commentaires
  FOR SELECT USING (approved = true);

-- Public can insert comments
CREATE POLICY "Tout le monde peut créer un commentaire" ON commentaires
  FOR INSERT WITH CHECK (true);

-- Users can update their own comments (via session_token)
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres commentaires" ON commentaires
  FOR UPDATE USING (
    session_token = current_setting('app.session_token', true)
  );

-- Users can delete their own comments (via session_token)
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres commentaires" ON commentaires
  FOR DELETE USING (
    session_token = current_setting('app.session_token', true)
  );

-- Admins have full access (handled via service role key in API routes)
-- No policy needed as service role bypasses RLS

-- Comments
COMMENT ON TABLE commentaires IS 'Table storing product reviews and ratings from customers';
COMMENT ON COLUMN commentaires.session_token IS 'Token stored in cookie to allow users to edit/delete their own comments';
COMMENT ON COLUMN commentaires.flagged IS 'Flagged for review by spam detection or admin';
COMMENT ON COLUMN commentaires.approved IS 'Whether the comment is approved and visible to public';

