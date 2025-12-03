-- Enable realtime for produits table to allow real-time stock updates
-- This ensures UI can react immediately when stock changes

-- Add produits table to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'produits'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE produits;
  END IF;
END $$;

-- Set REPLICA IDENTITY to allow realtime to capture UPDATE events
ALTER TABLE produits REPLICA IDENTITY DEFAULT;

-- Note: This allows realtime subscriptions to listen for:
-- - INSERT: New products added
-- - UPDATE: Stock changes, price changes, etc.
-- - DELETE: Products removed

