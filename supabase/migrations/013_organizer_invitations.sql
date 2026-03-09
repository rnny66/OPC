-- Organizer invitations table + admin role update policy

-- organizer_invitations table
CREATE TABLE public.organizer_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

-- Enable RLS
ALTER TABLE public.organizer_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies: admin-only access
CREATE POLICY "Admin select organizer_invitations" ON public.organizer_invitations
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin insert organizer_invitations" ON public.organizer_invitations
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin update organizer_invitations" ON public.organizer_invitations
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin delete organizer_invitations" ON public.organizer_invitations
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger function: auto-promote invited users to organizer on profile creation
CREATE OR REPLACE FUNCTION public.handle_organizer_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new profile's email has a pending invitation
  IF EXISTS (
    SELECT 1 FROM public.organizer_invitations
    WHERE email = NEW.email AND accepted_at IS NULL
  ) THEN
    -- Promote to organizer
    NEW.role := 'organizer';
    -- Mark invitation as accepted
    UPDATE public.organizer_invitations
    SET accepted_at = now()
    WHERE email = NEW.email AND accepted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- BEFORE INSERT trigger on profiles so NEW.role can be modified
CREATE TRIGGER trg_handle_organizer_invitation
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_organizer_invitation();

-- New RLS policy on profiles: admins can update any user's profile
CREATE POLICY "Admins can update user roles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
