-- Create admin_push_tokens table to store push notification tokens
CREATE TABLE IF NOT EXISTS admin_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
  user_id TEXT,
  device_name TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_push_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read their own tokens
CREATE POLICY "Users can read their own push tokens"
  ON admin_push_tokens
  FOR SELECT
  USING (true); -- For admin app, we'll allow all authenticated users to read all tokens

-- Policy: Only authenticated users can insert tokens
CREATE POLICY "Users can insert push tokens"
  ON admin_push_tokens
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own tokens
CREATE POLICY "Users can update their own push tokens"
  ON admin_push_tokens
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Users can delete their own tokens
CREATE POLICY "Users can delete their own push tokens"
  ON admin_push_tokens
  FOR DELETE
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_push_tokens_active ON admin_push_tokens(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_admin_push_tokens_device_type ON admin_push_tokens(device_type);

-- Enable pg_net extension for HTTP requests (Supabase recommended)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to call the edge function when a new order is created
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
  edge_function_url TEXT;
BEGIN
  -- Get Supabase URL and service role key from environment
  -- These should be set in Supabase dashboard under Settings > API
  supabase_url := current_setting('app.supabase_url', true);
  service_role_key := current_setting('app.supabase_service_role_key', true);
  
  -- If not set, try to get from environment variables (for local dev)
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := COALESCE(
      current_setting('app.supabase_url', true),
      'https://your-project.supabase.co' -- Replace with your Supabase URL
    );
  END IF;
  
  IF service_role_key IS NULL OR service_role_key = '' THEN
    service_role_key := COALESCE(
      current_setting('app.supabase_service_role_key', true),
      '' -- Will be set via Supabase dashboard
    );
  END IF;
  
  -- Build edge function URL
  edge_function_url := supabase_url || '/functions/v1/send-push-notification';
  
  -- Call the Supabase Edge Function via pg_net
  PERFORM
    net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'type', TG_OP,
        'record', row_to_json(NEW),
        'old_record', CASE WHEN OLD IS NULL THEN NULL ELSE row_to_json(OLD) END
      )
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error calling push notification function: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new order is inserted
DROP TRIGGER IF EXISTS trigger_notify_new_order ON commandes;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON commandes
  FOR EACH ROW
  WHEN (NEW.statut = 'En attente')
  EXECUTE FUNCTION notify_new_order();

-- Note: To configure this in Supabase:
-- 1. Go to Database > Settings > Extensions and enable pg_net
-- 2. Set the following in Supabase dashboard or via SQL:
--    ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
--    ALTER DATABASE postgres SET app.supabase_service_role_key = 'your-service-role-key';
-- 
-- Alternative: Use Supabase Database Webhooks (recommended for production)
-- Go to Database > Webhooks and create a webhook that calls the edge function

