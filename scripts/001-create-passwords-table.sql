-- Create passwords table for storing encrypted password entries
CREATE TABLE IF NOT EXISTS passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT,
  encrypted_password TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Social', 'Bank', 'Learning', 'Business', 'Government', 'Technology')),
  notes TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords(category);

-- Enable Row Level Security
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own passwords
CREATE POLICY "Users can view own passwords"
  ON passwords
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own passwords
CREATE POLICY "Users can insert own passwords"
  ON passwords
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own passwords
CREATE POLICY "Users can update own passwords"
  ON passwords
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can only delete their own passwords
CREATE POLICY "Users can delete own passwords"
  ON passwords
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_passwords_updated_at ON passwords;
CREATE TRIGGER update_passwords_updated_at
  BEFORE UPDATE ON passwords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
