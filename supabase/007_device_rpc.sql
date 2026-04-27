-- RPC: append a device_id to the profiles.device_ids JSONB array for a given auth user.
-- Called by /api/profile/link-auth after magic-link sign-in.
-- SECURITY DEFINER so it can update any profile row (auth user linking their own device).

CREATE OR REPLACE FUNCTION append_device_id(p_user_id UUID, p_device_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET device_ids = COALESCE(device_ids, '[]'::JSONB) || to_jsonb(p_device_id)
  WHERE auth_user_id = p_user_id
    AND NOT (device_ids @> to_jsonb(p_device_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
