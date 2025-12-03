-- Migration: Add email column to commandes table
-- This enables optional email collection for order notifications

ALTER TABLE commandes 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Comment
COMMENT ON COLUMN commandes.email IS 'Optional email address for order notifications';


