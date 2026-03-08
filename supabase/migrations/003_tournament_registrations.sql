-- Create tournament registrations table
CREATE TABLE public.tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'no_show')),
  registered_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  UNIQUE (tournament_id, player_id)
);

-- Indexes
CREATE INDEX idx_registrations_tournament ON public.tournament_registrations (tournament_id);
CREATE INDEX idx_registrations_player ON public.tournament_registrations (player_id);
CREATE INDEX idx_registrations_status ON public.tournament_registrations (status);

-- Enable RLS
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Players can see their own registrations
CREATE POLICY "Players can view own registrations" ON public.tournament_registrations
  FOR SELECT USING (player_id = auth.uid());

-- Organizers can see registrations for their tournaments
CREATE POLICY "Organizers can view tournament registrations" ON public.tournament_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id
      AND organizer_id = auth.uid()
    )
  );

-- Admins can see all registrations
CREATE POLICY "Admins can view all registrations" ON public.tournament_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Authenticated users can register (with verification check handled in app)
CREATE POLICY "Authenticated users can register" ON public.tournament_registrations
  FOR INSERT WITH CHECK (
    auth.uid() = player_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND onboarding_complete = true
    )
  );

-- Players can cancel their own registration
CREATE POLICY "Players can cancel own registration" ON public.tournament_registrations
  FOR UPDATE USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- Organizers can update status for their tournament registrations
CREATE POLICY "Organizers can update registration status" ON public.tournament_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id
      AND organizer_id = auth.uid()
    )
  );
