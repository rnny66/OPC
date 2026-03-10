-- Feature flags for dripfeeding functionality to client
CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  label TEXT NOT NULL,
  description TEXT,
  tier INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can read flags (needed by middleware, server components, sidebar)
CREATE POLICY "Anyone can read feature flags"
  ON public.feature_flags FOR SELECT USING (true);

-- Only service_role can modify (dev admin page uses admin client)
-- No INSERT/UPDATE/DELETE policies for anon/authenticated roles

-- Seed all flags as disabled
INSERT INTO public.feature_flags (key, enabled, label, description, tier, sort_order) VALUES
  ('tournament_browsing',     false, 'Tournament Browsing',     'Browse tournaments page and cards',                2, 10),
  ('tournament_detail',       false, 'Tournament Detail',       'Individual tournament detail pages',                2, 20),
  ('tournament_registration', false, 'Tournament Registration', 'Register for tournaments',                         3, 30),
  ('cancel_registration',     false, 'Cancel Registration',     'Cancel tournament registrations',                   3, 40),
  ('organizer_tools',         false, 'Organizer Tools',         'Organizer dashboard and tournament management',     4, 50),
  ('results_entry',           false, 'Results Entry',           'Tournament results entry',                          4, 60),
  ('rankings',                false, 'Rankings',                'Public leaderboard page',                           5, 70),
  ('player_profiles',         false, 'Player Profiles',         'Public player profile pages',                       5, 80),
  ('admin_panel',             false, 'Admin Panel',             'Full admin panel access',                           6, 90),
  ('identity_verification',   false, 'Identity Verification',   'Didit identity verification flow',                  7, 100),
  ('avatar_upload',           false, 'Avatar Upload',           'Profile avatar upload',                             7, 110),
  ('csv_export',              false, 'CSV Export',              'Export registrations to CSV',                        7, 120);
