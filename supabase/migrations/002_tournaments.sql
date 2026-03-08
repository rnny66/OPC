-- Create tournaments table (expanded from existing plan)
CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  club_name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  series text NOT NULL DEFAULT 'OPC Open',
  start_date date NOT NULL,
  end_date date NOT NULL,
  entry_fee integer NOT NULL DEFAULT 0,
  image_url text,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  organizer_id uuid REFERENCES public.profiles(id),
  description text,
  capacity integer,
  registration_open boolean NOT NULL DEFAULT true,
  registration_deadline timestamptz,
  venue_address text,
  contact_email text,
  points_multiplier numeric NOT NULL DEFAULT 1.0,
  requires_verification boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tournaments_start_date ON public.tournaments (start_date ASC);
CREATE INDEX idx_tournaments_country ON public.tournaments (country);
CREATE INDEX idx_tournaments_series ON public.tournaments (series);
CREATE INDEX idx_tournaments_status ON public.tournaments (status);
CREATE INDEX idx_tournaments_organizer ON public.tournaments (organizer_id);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read tournaments
CREATE POLICY "Public read tournaments" ON public.tournaments
  FOR SELECT USING (true);

-- Organizers and admins can insert
CREATE POLICY "Organizers can create tournaments" ON public.tournaments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('organizer', 'admin')
    )
  );

-- Organizers can update their own tournaments, admins can update any
CREATE POLICY "Organizers can update own tournaments" ON public.tournaments
  FOR UPDATE USING (
    organizer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY "Admins can delete tournaments" ON public.tournaments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Auto-update updated_at (reuse existing function)
CREATE TRIGGER tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed mock data (same 16 tournaments from the static mockup)
INSERT INTO public.tournaments (name, club_name, city, country, series, start_date, end_date, entry_fee, status) VALUES
  ('Amsterdam Open',        'Holland Casino',          'Amsterdam',  'NL', 'OPC Main',  '2026-03-11', '2026-03-14', 0,     'upcoming'),
  ('Berlin Masters',        'Casino Berlin',           'Berlin',     'DE', 'OPC Main',  '2026-03-18', '2026-03-21', 5000,  'upcoming'),
  ('Brussels Classic',      'Grand Casino Brussels',   'Brussels',   'BE', 'OPC Open',  '2026-03-25', '2026-03-28', 0,     'upcoming'),
  ('London Series',         'The Hippodrome',          'London',     'GB', 'OPC Main',  '2026-04-01', '2026-04-04', 10000, 'upcoming'),
  ('Rotterdam Cup',         'Holland Casino',          'Rotterdam',  'NL', 'OPC Open',  '2026-04-08', '2026-04-11', 5000,  'upcoming'),
  ('Munich Invitational',   'Bayerischer Poker Club',  'Munich',     'DE', 'OPC Open',  '2026-04-15', '2026-04-18', 0,     'upcoming'),
  ('Antwerp Open',          'Stardust Casino',         'Antwerp',    'BE', 'OPC Main',  '2026-04-22', '2026-04-25', 10000, 'upcoming'),
  ('Edinburgh Grand',       'Grosvenor Casino',        'Edinburgh',  'GB', 'OPC Open',  '2026-04-29', '2026-05-02', 0,     'upcoming'),
  ('The Hague Championship','Holland Casino',          'The Hague',  'NL', 'OPC Main',  '2026-05-06', '2026-05-09', 5000,  'upcoming'),
  ('Hamburg Open',          'Casino Esplanade',        'Hamburg',    'DE', 'OPC Open',  '2026-05-13', '2026-05-16', 0,     'upcoming'),
  ('Ghent Classic',         'Casino de Gand',          'Ghent',      'BE', 'OPC Main',  '2026-05-20', '2026-05-23', 10000, 'upcoming'),
  ('Manchester Series',     'Manchester235',           'Manchester', 'GB', 'OPC Open',  '2026-05-27', '2026-05-30', 5000,  'upcoming'),
  ('Utrecht Open',          'Holland Casino',          'Utrecht',    'NL', 'OPC Open',  '2026-06-03', '2026-06-06', 0,     'upcoming'),
  ('Cologne Cup',           'Poker Club Cologne',      'Cologne',    'DE', 'OPC Main',  '2026-06-10', '2026-06-13', 5000,  'upcoming'),
  ('Bruges Invitational',   'Casino Brugge',           'Bruges',     'BE', 'OPC Open',  '2026-06-17', '2026-06-20', 0,     'upcoming'),
  ('Bristol Championship',  'Grosvenor Casino',        'Bristol',    'GB', 'OPC Main',  '2026-06-24', '2026-06-27', 10000, 'upcoming');
