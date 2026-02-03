-- Store one encryption key per user. Passwords are tied to the account (email),
-- not to the login password, so changing password does not lose access to saved passwords.
CREATE TABLE IF NOT EXISTS user_vault_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  encryption_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only read/insert/update their own vault key
ALTER TABLE user_vault_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vault key"
  ON user_vault_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault key"
  ON user_vault_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault key"
  ON user_vault_keys
  FOR UPDATE
  USING (auth.uid() = user_id);
