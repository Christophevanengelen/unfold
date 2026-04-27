-- Unfold — User identity migration
-- Purpose: link anonymous device_id profiles to Supabase Auth user_id
-- so subscriptions and entitlements can be user-scoped, not device-scoped.
--
-- Idempotent — safe to re-run.

-- Add auth_user_id to profiles (FK to Supabase Auth user)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add email (denormalized from auth.users for quick filter / support workflows)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Track every device_id ever linked to this profile (set, deduped at app level)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS device_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add owner_user_id to connections (sub-aware ownership). Falls back to
-- owner_device_id for legacy rows. ON DELETE SET NULL because deleting a
-- user should NOT cascade-delete the partner's connection record.
ALTER TABLE connections
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_connections_owner_user ON connections(owner_user_id);

-- ─── RLS — strict reads, service-role writes only (Phase 1) ──────────────────
-- Enable RLS but keep policies permissive enough that the service-role keys
-- still work for our existing /api/profile/upsert and /api/connection/upsert
-- routes (they use getAdminClient which bypasses RLS).
-- Browser clients can SELECT their own row only when authenticated.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_users_read_own_profile" ON profiles;
CREATE POLICY "auth_users_read_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "auth_users_update_own_profile" ON profiles;
CREATE POLICY "auth_users_update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_users_read_own_connections" ON connections;
CREATE POLICY "auth_users_read_own_connections"
  ON connections FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "auth_users_write_own_connections" ON connections;
CREATE POLICY "auth_users_write_own_connections"
  ON connections FOR ALL
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());
