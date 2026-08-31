-- Unfold / Favorable — durable counters for the AI budget guard.
--
-- Why a new table instead of reusing `usage_counters` (005_billing.sql):
--   usage_counters.user_id is `UUID NOT NULL REFERENCES auth.users(id)`.
--   The routes we have to bound are called by visitors who are NOT signed in
--   (landing hero, demo timeline). They have no auth.users row, so they can
--   never be counted there. This table is keyed by an opaque TEXT subject
--   (hashed session id, hashed IP, or the literal 'all' for the global cap).
--
-- Windows are fixed buckets: `window_start` is the UTC start of the hour or of
-- the day. Rows are disposable — anything older than 7 days can be deleted.
--
-- Idempotent.

CREATE TABLE IF NOT EXISTS ai_usage_counters (
  scope        TEXT        NOT NULL,          -- 'caller' | 'ip' | 'global'
  subject      TEXT        NOT NULL,          -- hashed identity, or 'all'
  bucket       TEXT        NOT NULL,          -- route key: 'openai'
  window_start TIMESTAMPTZ NOT NULL,          -- UTC start of the hour / day
  count        INTEGER     NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (scope, subject, bucket, window_start)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_window
  ON ai_usage_counters(window_start);

ALTER TABLE ai_usage_counters ENABLE ROW LEVEL SECURITY;
-- No policy on purpose: service-role writes only, never readable by a browser.

-- Atomic increment. Returns the post-increment count so the caller can compare
-- it to the limit without a second round-trip and without a read/write race.
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_scope        TEXT,
  p_subject      TEXT,
  p_bucket       TEXT,
  p_window_start TIMESTAMPTZ
) RETURNS INTEGER AS $$
DECLARE
  result_count INTEGER;
BEGIN
  INSERT INTO ai_usage_counters (scope, subject, bucket, window_start, count)
  VALUES (p_scope, p_subject, p_bucket, p_window_start, 1)
  ON CONFLICT (scope, subject, bucket, window_start)
  DO UPDATE SET count = ai_usage_counters.count + 1, updated_at = now()
  RETURNING count INTO result_count;
  RETURN result_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION increment_ai_usage(TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_ai_usage(TEXT, TEXT, TEXT, TIMESTAMPTZ) TO service_role;

-- Housekeeping helper. Call from a cron if the table ever grows enough to care.
CREATE OR REPLACE FUNCTION purge_ai_usage(p_older_than INTERVAL DEFAULT '7 days')
RETURNS INTEGER AS $$
DECLARE
  removed INTEGER;
BEGIN
  DELETE FROM ai_usage_counters WHERE window_start < now() - p_older_than;
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION purge_ai_usage(INTERVAL) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION purge_ai_usage(INTERVAL) TO service_role;
