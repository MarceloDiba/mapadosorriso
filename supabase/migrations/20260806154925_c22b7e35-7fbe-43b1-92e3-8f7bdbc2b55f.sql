-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- CLINICS -------------------------------------------------------------
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  city text,
  whatsapp text NOT NULL DEFAULT '',
  logo_url text,
  contract_start date,
  contract_end date,
  is_active boolean NOT NULL DEFAULT true,
  palette text NOT NULL DEFAULT 'marfim',
  font_pair text NOT NULL DEFAULT 'cormorant',
  images jsonb NOT NULL DEFAULT '{}'::jsonb,
  copy jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clinics_slug_idx ON public.clinics (slug);

GRANT SELECT ON public.clinics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics TO authenticated;
GRANT ALL ON public.clinics TO service_role;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads live clinics" ON public.clinics
  FOR SELECT TO anon, authenticated
  USING (
    is_active
    AND (contract_start IS NULL OR contract_start <= current_date)
    AND (contract_end IS NULL OR contract_end >= current_date)
  );

CREATE POLICY "admins read all clinics" ON public.clinics
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins insert clinics" ON public.clinics
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update clinics" ON public.clinics
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete clinics" ON public.clinics
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER clinics_set_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SESSIONS ------------------------------------------------------------
CREATE TABLE public.clinic_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  style text,
  concerns text[] NOT NULL DEFAULT '{}',
  objection text,
  decision text,
  completed boolean NOT NULL DEFAULT false,
  whatsapp_clicked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clinic_sessions_clinic_idx ON public.clinic_sessions (clinic_id, created_at DESC);

GRANT INSERT, UPDATE ON public.clinic_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.clinic_sessions TO authenticated;
GRANT ALL ON public.clinic_sessions TO service_role;
ALTER TABLE public.clinic_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone starts a session" ON public.clinic_sessions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "anyone updates a recent session" ON public.clinic_sessions
  FOR UPDATE TO anon, authenticated
  USING (created_at > now() - interval '6 hours')
  WITH CHECK (created_at > now() - interval '6 hours');

CREATE POLICY "admins read sessions" ON public.clinic_sessions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER clinic_sessions_set_updated_at
  BEFORE UPDATE ON public.clinic_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED ----------------------------------------------------------------
INSERT INTO public.clinics (slug, name, city, whatsapp, contract_start, contract_end, is_active)
VALUES ('clinica-modelo', 'Clínica Modelo', 'São Paulo', '5511999999999', current_date, current_date + interval '365 days', true);