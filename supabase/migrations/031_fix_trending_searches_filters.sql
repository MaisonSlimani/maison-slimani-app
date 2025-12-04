-- Fix trending searches to only show meaningful, popular queries
-- Requirements:
-- 1. Minimum query length: 4 characters
-- 2. Minimum search count: 3 searches
-- 3. Must have results (results_count > 0)
-- 4. Within last 7 days

CREATE OR REPLACE FUNCTION get_trending_searches(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (query TEXT, search_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.query,
    COUNT(*)::BIGINT as search_count
  FROM search_queries sq
  WHERE sq.created_at > NOW() - INTERVAL '7 days'
    AND sq.results_count > 0
    AND LENGTH(TRIM(sq.query)) >= 4  -- Minimum 4 characters
    AND TRIM(sq.query) !~ '^[^a-zA-Z0-9]*$'  -- Must contain at least one alphanumeric character
  GROUP BY sq.query
  HAVING COUNT(*) >= 3  -- Must be searched at least 3 times
  ORDER BY search_count DESC, sq.query ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

