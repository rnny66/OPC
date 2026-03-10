-- Feature flags for CMS (Payload CMS) functionality
INSERT INTO public.feature_flags (key, enabled, label, description, tier, sort_order) VALUES
  ('cms_admin',   false, 'CMS Admin',   'Payload CMS admin panel for content management', 8, 130),
  ('cms_news',    false, 'CMS News',    'Public news page (/news)',                        8, 140),
  ('cms_blog',    false, 'CMS Blog',    'Public blog page (/blog)',                        8, 150),
  ('cms_events',  false, 'CMS Events',  'Public events page (/events)',                    8, 160);
