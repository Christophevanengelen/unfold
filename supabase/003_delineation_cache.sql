-- LLM delineation cache — shared across all users with same birth data
-- Key: birth_hash + boudin_id + profile_hash
-- Same birth chart + same boudin + same user profile = same delineation (no need to re-call OpenAI)

CREATE TABLE IF NOT EXISTS delineation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  birth_hash TEXT NOT NULL,
  boudin_id TEXT NOT NULL,
  profile_hash TEXT NOT NULL DEFAULT 'none',
  delineation JSONB NOT NULL,
  model TEXT DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_delineation_cache UNIQUE (birth_hash, boudin_id, profile_hash)
);

CREATE INDEX IF NOT EXISTS idx_delineation_lookup
  ON delineation_cache(birth_hash, boudin_id, profile_hash);
