-- Unfold — Initial Supabase Schema
-- Tables: profiles, connections, invite_codes

-- Profiles: one per device (anonymous identity)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  nickname TEXT,
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

-- Connections: relationships between users
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_device_id TEXT NOT NULL REFERENCES profiles(device_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initial TEXT,
  relationship TEXT NOT NULL CHECK (relationship IN ('partner', 'friend', 'family', 'colleague')),
  birth_date TEXT,
  birth_time TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  timezone TEXT,
  place_of_birth TEXT,
  invite_code TEXT NOT NULL,
  connected_since TIMESTAMPTZ DEFAULT now()
);

-- Invite codes: server-side validation
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  owner_device_id TEXT NOT NULL REFERENCES profiles(device_id) ON DELETE CASCADE,
  claimed_by_device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  claimed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_connections_owner ON connections(owner_device_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_profiles_invite_code ON profiles(invite_code);
