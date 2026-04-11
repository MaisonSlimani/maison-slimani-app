-- Create a table to store rate limit data persistently
-- This ensures rate limiting works across serverless cold starts
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    expires_at BIGINT NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Service role only for safety)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access at all
CREATE POLICY "Rate limits are service-only" 
ON public.rate_limits 
FOR ALL 
USING (false);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at ON public.rate_limits(expires_at);

-- Automate cleanup of expired entries (if we have a cron or just manual cleanup in code)
-- For now, we'll handle cleanup in the application logic during fetch.
