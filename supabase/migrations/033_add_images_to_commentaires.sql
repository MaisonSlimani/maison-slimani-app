-- Migration: Add images column to commentaires table
-- This allows users to upload images with their reviews

ALTER TABLE commentaires 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add index for images column (for queries filtering by images)
CREATE INDEX IF NOT EXISTS idx_commentaires_images ON commentaires USING GIN (images);

-- Comments
COMMENT ON COLUMN commentaires.images IS 'Array of image URLs uploaded by the user with their review (max 5-6 images)';

