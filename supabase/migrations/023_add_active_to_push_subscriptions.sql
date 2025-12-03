-- Add active column to user_push_subscriptions if it doesn't exist
-- This migration ensures the active column exists for filtering subscriptions

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_push_subscriptions' 
    AND column_name = 'active'
  ) THEN
    ALTER TABLE user_push_subscriptions 
    ADD COLUMN active BOOLEAN DEFAULT TRUE;
    
    -- Set all existing subscriptions as active
    UPDATE user_push_subscriptions 
    SET active = TRUE 
    WHERE active IS NULL;
  END IF;
END $$;

