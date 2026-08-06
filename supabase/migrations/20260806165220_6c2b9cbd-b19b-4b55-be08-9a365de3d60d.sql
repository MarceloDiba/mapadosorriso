ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS contract_value numeric(12,2),
  ADD COLUMN IF NOT EXISTS sale_date date;

ALTER TABLE public.clinic_sessions
  ADD COLUMN IF NOT EXISTS funnel_step smallint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS lead_name text,
  ADD COLUMN IF NOT EXISTS lead_phone text;

CREATE INDEX IF NOT EXISTS clinic_sessions_clinic_created_idx
  ON public.clinic_sessions (clinic_id, created_at DESC);