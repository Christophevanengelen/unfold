-- Atomic increment for usage_counters.
-- Uses INSERT...ON CONFLICT...DO UPDATE for race-safe counting under
-- concurrent webhook / API load.

CREATE OR REPLACE FUNCTION increment_usage_counter(
  p_user_id UUID,
  p_feature TEXT,
  p_period_start TIMESTAMPTZ
) RETURNS INTEGER AS $$
DECLARE
  result_count INTEGER;
BEGIN
  INSERT INTO usage_counters (user_id, feature, period_start, count)
  VALUES (p_user_id, p_feature, p_period_start, 1)
  ON CONFLICT (user_id, feature, period_start)
  DO UPDATE SET count = usage_counters.count + 1
  RETURNING count INTO result_count;
  RETURN result_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow service role to call this (browser clients should never call directly)
REVOKE ALL ON FUNCTION increment_usage_counter(UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_usage_counter(UUID, TEXT, TIMESTAMPTZ) TO service_role;
