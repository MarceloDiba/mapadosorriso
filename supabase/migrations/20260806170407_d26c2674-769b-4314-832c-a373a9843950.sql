-- 1) Ownership secret for each quiz session
ALTER TABLE public.clinic_sessions
  ADD COLUMN IF NOT EXISTS session_token uuid NOT NULL DEFAULT gen_random_uuid();

-- 2) Remove unrestricted anonymous write access; writes go through the server only
DROP POLICY IF EXISTS "anyone starts a session" ON public.clinic_sessions;
DROP POLICY IF EXISTS "anyone updates a recent session" ON public.clinic_sessions;
DROP POLICY IF EXISTS "admins read sessions" ON public.clinic_sessions;

REVOKE INSERT, UPDATE, DELETE ON public.clinic_sessions FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.clinic_sessions FROM authenticated;
GRANT SELECT ON public.clinic_sessions TO authenticated;
GRANT ALL ON public.clinic_sessions TO service_role;

CREATE POLICY "admins read sessions"
ON public.clinic_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- 3) Clinics admin policies without the SECURITY DEFINER helper
DROP POLICY IF EXISTS "admins read all clinics" ON public.clinics;
DROP POLICY IF EXISTS "admins insert clinics" ON public.clinics;
DROP POLICY IF EXISTS "admins update clinics" ON public.clinics;
DROP POLICY IF EXISTS "admins delete clinics" ON public.clinics;

CREATE POLICY "admins read all clinics"
ON public.clinics FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "admins insert clinics"
ON public.clinics FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "admins update clinics"
ON public.clinics FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "admins delete clinics"
ON public.clinics FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

-- 4) The SECURITY DEFINER helper is no longer callable by app users
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;