-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  first_name text,
  last_name text,
  avatar_url text,
  bio text CHECK (char_length(bio) <= 500),
  city text,
  home_country text,
  nationality text[] DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'organizer', 'admin')),
  identity_verified boolean NOT NULL DEFAULT false,
  identity_verified_at timestamptz,
  didit_session_id text,
  date_of_birth date,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_home_country ON public.profiles (home_country);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read basic profile info
CREATE POLICY "Public read basic profile" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile (but not role or verification fields)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND identity_verified = (SELECT identity_verified FROM public.profiles WHERE id = auth.uid())
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
