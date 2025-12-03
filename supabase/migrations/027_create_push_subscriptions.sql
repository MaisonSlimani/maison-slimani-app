-- Create push_subscriptions table for Web Push Notifications
-- Supports multiple devices per admin (using device_id)

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  device_id TEXT NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_admin_email FOREIGN KEY (admin_email) REFERENCES admins(email) ON DELETE CASCADE,
  CONSTRAINT unique_admin_device UNIQUE (admin_email, device_id)
);

-- Create index for fast lookups by admin email
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_admin_email ON push_subscriptions(admin_email);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can only see/modify their own subscriptions
CREATE POLICY "Admins can manage their own push subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (
    admin_email = (
      SELECT email 
      FROM admins 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      LIMIT 1
    )
  );

-- Note: For service role operations (edge functions), RLS is bypassed
-- The edge function uses service role key which bypasses RLS

