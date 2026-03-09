-- Create tournament_results table
CREATE TABLE public.tournament_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  placement integer NOT NULL CHECK (placement > 0),
  points_awarded integer NOT NULL DEFAULT 0,
  entered_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, player_id)
);

-- Indexes
CREATE INDEX idx_results_tournament ON public.tournament_results (tournament_id);
CREATE INDEX idx_results_player ON public.tournament_results (player_id);
CREATE INDEX idx_results_placement ON public.tournament_results (placement);

-- Enable RLS
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;

-- Anyone can read results
CREATE POLICY "Public read results" ON public.tournament_results
  FOR SELECT USING (true);

-- Organizers can insert results for their tournaments
CREATE POLICY "Organizers can insert results" ON public.tournament_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id
      AND organizer_id = auth.uid()
    )
  );

-- Organizers can update results for their tournaments
CREATE POLICY "Organizers can update results" ON public.tournament_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id
      AND organizer_id = auth.uid()
    )
  );

-- Admins can do everything
CREATE POLICY "Admins full access results" ON public.tournament_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
