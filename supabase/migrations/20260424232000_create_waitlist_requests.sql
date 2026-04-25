-- Cycle 19: demand capture for zero-result public searches.

CREATE TABLE IF NOT EXISTS public.waitlist_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  city text,
  service text,
  source_path text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "waitlist_requests_admin_read" ON public.waitlist_requests;
CREATE POLICY "waitlist_requests_admin_read"
ON public.waitlist_requests
FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "waitlist_requests_admin_manage" ON public.waitlist_requests;
CREATE POLICY "waitlist_requests_admin_manage"
ON public.waitlist_requests
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS waitlist_requests_created_at_idx ON public.waitlist_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS waitlist_requests_city_service_idx ON public.waitlist_requests (lower(city), lower(service));
