-- Add slug column to profiles
ALTER TABLE public.profiles ADD COLUMN slug text;

-- Slug generation function
CREATE OR REPLACE FUNCTION public.generate_profile_slug(p_display_name text, p_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_slug text;
  v_slug text;
  v_counter integer := 1;
BEGIN
  -- Lowercase, replace non-alphanumeric with hyphens, trim leading/trailing hyphens
  v_base_slug := lower(trim(both '-' from regexp_replace(
    regexp_replace(COALESCE(p_display_name, 'player'), '[^a-zA-Z0-9\s-]', '', 'g'),
    '[\s]+', '-', 'g'
  )));

  -- Fallback for empty slugs
  IF v_base_slug = '' OR v_base_slug IS NULL THEN
    v_base_slug := 'player';
  END IF;

  v_slug := v_base_slug;

  -- Handle collisions: append -2, -3, etc.
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = v_slug AND id != p_id) LOOP
    v_counter := v_counter + 1;
    v_slug := v_base_slug || '-' || v_counter;
  END LOOP;

  RETURN v_slug;
END;
$$;

-- Trigger function to auto-set slug
CREATE OR REPLACE FUNCTION public.handle_profile_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.display_name IS DISTINCT FROM OLD.display_name) THEN
    NEW.slug := public.generate_profile_slug(NEW.display_name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_slug
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_slug();

-- Backfill existing profiles
UPDATE public.profiles
SET slug = public.generate_profile_slug(display_name, id)
WHERE slug IS NULL;

-- Now make it NOT NULL + UNIQUE
ALTER TABLE public.profiles ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_profiles_slug ON public.profiles (slug);
