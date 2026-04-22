-- Unfold — Canonical Supabase Schema (idempotent, safe to re-run)
-- Tables: profiles, connections, invite_codes, delineation_cache, connection_cache
-- RLS: permissive (all writes go through Next.js API with service_role key;
--      no direct browser access in Phase 1).
-- Run with: npm run db:migrate

-- ─── Triggers: updated_at auto-maintenance ──────────────────
CREATE OR REPLACE FUNCTION unfold_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Profiles: one per device (anonymous identity) ──────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  nickname TEXT,
  display_name TEXT,
  birth_date TEXT,
  birth_time TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  timezone TEXT,
  place_of_birth TEXT,
  invite_code TEXT UNIQUE,
  plan TEXT DEFAULT 'free',
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add display_name to pre-existing installs that didn't have it
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION unfold_set_updated_at();

-- ─── Connections: relationships between users ───────────────
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_device_id TEXT NOT NULL REFERENCES profiles(device_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initial TEXT,
  relationship TEXT NOT NULL
    CHECK (relationship IN ('partner', 'friend', 'family', 'colleague')),
  birth_date TEXT,
  birth_time TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  timezone TEXT,
  place_of_birth TEXT,
  invite_code TEXT NOT NULL,
  connected_since TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate invites per owner
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_connections_owner_invite'
  ) THEN
    ALTER TABLE connections
      ADD CONSTRAINT uq_connections_owner_invite
      UNIQUE (owner_device_id, invite_code);
  END IF;
END $$;

ALTER TABLE connections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS trg_connections_updated_at ON connections;
CREATE TRIGGER trg_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION unfold_set_updated_at();

-- ─── Invite codes: server-side validation ───────────────────
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  owner_device_id TEXT NOT NULL REFERENCES profiles(device_id) ON DELETE CASCADE,
  claimed_by_device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  claimed_at TIMESTAMPTZ
);

-- Enforce code shape UNFOLD-XXXX (4 alphanumeric, no confusable chars)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_invite_codes_shape'
  ) THEN
    ALTER TABLE invite_codes
      ADD CONSTRAINT chk_invite_codes_shape
      CHECK (code ~ '^UNFOLD-[A-Z0-9]{4}$');
  END IF;
END $$;

-- ─── Delineation cache: shared LLM responses keyed by signal ─
-- Used by:
--   • /api/openai/personalize            (single-person, boudin_id = "tt_NN")
--   • /api/openai/connection-delineation (couple, boudin_id = "couple_{rel}_{monthKey}_v{N}")
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

-- ─── Connection brief cache: raw toctoc connection-brief JSON ─
-- Used by /api/toctoc (endpoint=connection-brief) to avoid re-querying
-- Marie Ange's API for the same pair on the same target_month.
-- TTL: 24h (transits move slowly — re-fetch daily at most).
CREATE TABLE IF NOT EXISTS connection_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_hash TEXT NOT NULL,       -- order-independent hash of both birth datas
  target_month TEXT NOT NULL,    -- YYYY-MM
  brief JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_connection_cache UNIQUE (pair_hash, target_month)
);

CREATE INDEX IF NOT EXISTS idx_connection_cache_lookup
  ON connection_cache(pair_hash, target_month);

-- ─── Supporting indexes ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_connections_owner ON connections(owner_device_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_profiles_invite_code ON profiles(invite_code);
