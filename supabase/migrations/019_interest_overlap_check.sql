-- Prevent overlapping interest signups:
--   "both" covers "player" and "organizer", so block redundant rows.
CREATE OR REPLACE FUNCTION check_interest_overlap()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Signing up as player/organizer when "both" already exists
  IF NEW.interest_type IN ('player', 'organizer') THEN
    IF EXISTS (
      SELECT 1 FROM interest_signups
      WHERE lower(email) = lower(NEW.email)
      AND interest_type = 'both'
    ) THEN
      RAISE EXCEPTION 'duplicate key value violates unique constraint "interest_signups_email_type_unique"'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  -- Signing up as "both" when player or organizer already exists
  IF NEW.interest_type = 'both' THEN
    IF EXISTS (
      SELECT 1 FROM interest_signups
      WHERE lower(email) = lower(NEW.email)
      AND interest_type IN ('player', 'organizer')
    ) THEN
      RAISE EXCEPTION 'duplicate key value violates unique constraint "interest_signups_email_type_unique"'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_interest_overlap
  BEFORE INSERT ON interest_signups
  FOR EACH ROW
  EXECUTE FUNCTION check_interest_overlap();
