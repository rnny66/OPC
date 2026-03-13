-- Interest signups table for collecting email addresses
CREATE TABLE interest_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  interest_type text NOT NULL CHECK (interest_type IN ('player', 'organizer', 'both')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate signups for same email+type (case-insensitive on email)
CREATE UNIQUE INDEX interest_signups_email_type_unique
  ON interest_signups (lower(email), interest_type);

-- RLS
ALTER TABLE interest_signups ENABLE ROW LEVEL SECURITY;

-- Anon can insert only (for the public form)
CREATE POLICY "anon_insert_interest"
  ON interest_signups FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated admins can read all (for admin dashboard/export)
CREATE POLICY "admin_read_interest"
  ON interest_signups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete spam rows
CREATE POLICY "admin_delete_interest"
  ON interest_signups FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_interest_signups_type ON interest_signups (interest_type);
CREATE INDEX idx_interest_signups_created ON interest_signups (created_at DESC);
