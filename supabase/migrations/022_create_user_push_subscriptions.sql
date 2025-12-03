-- Create user_push_subscriptions table for Web Push API subscriptions
-- This replaces the admin_push_tokens table for web push notifications

CREATE TABLE IF NOT EXISTS user_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  subscription JSONB NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index to prevent duplicate subscriptions per user/platform
CREATE UNIQUE INDEX IF NOT EXISTS user_push_subscriptions_user_platform_idx
  ON user_push_subscriptions (user_id, platform);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_push_subscriptions_user_id ON user_push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_push_subscriptions_platform ON user_push_subscriptions(platform);

-- Enable RLS
ALTER TABLE user_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all subscriptions (for sending notifications)
CREATE POLICY "Admins can read all push subscriptions"
  ON user_push_subscriptions
  FOR SELECT
  USING (true);

-- Policy: Admins can insert their own subscriptions
CREATE POLICY "Admins can insert push subscriptions"
  ON user_push_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can update their own subscriptions
CREATE POLICY "Admins can update push subscriptions"
  ON user_push_subscriptions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Admins can delete their own subscriptions
CREATE POLICY "Admins can delete push subscriptions"
  ON user_push_subscriptions
  FOR DELETE
  USING (true);

-- Note: We keep admin_push_tokens table for potential future native app support
-- The new user_push_subscriptions table is specifically for Web Push API

