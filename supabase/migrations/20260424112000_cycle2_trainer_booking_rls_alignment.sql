-- Cycle 2: Align trainer and booking-request RLS with live provider/helper model
-- Revised after live apply attempt exposed schema mismatch (providers.slug absent)
-- Date: 2026-04-24

-- booking_requests currently has grants but no RLS/policies in live schema.
-- Live table stores denormalized provider text snapshots only, without provider_id FK.
-- Safe interim posture: accept request creation, block direct reads/updates from client roles.

alter table if exists public.booking_requests enable row level security;

DROP POLICY IF EXISTS "booking_requests_insert_anon_or_admin" ON public.booking_requests;
CREATE POLICY "booking_requests_insert_anon_or_admin"
ON public.booking_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  source = 'web_request_flow'
  AND status = 'pending'
  AND length(trim(provider_slug)) > 0
  AND length(trim(provider_name)) > 0
  AND length(trim(provider_city)) > 0
  AND length(trim(service_label)) > 0
  AND length(trim(pet_name)) > 0
  AND length(trim(pet_type)) > 0
);

DROP POLICY IF EXISTS "booking_requests_select_admin_only" ON public.booking_requests;
CREATE POLICY "booking_requests_select_admin_only"
ON public.booking_requests
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "booking_requests_update_admin_only" ON public.booking_requests;
CREATE POLICY "booking_requests_update_admin_only"
ON public.booking_requests
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- trainer_bookings exists live with no active policies present in the dump.
-- Keep compatibility with current table shape (trainer_id/user_id) while aligning
-- access checks to provider ownership where available and admin helper.

alter table if exists public.trainer_bookings enable row level security;

DROP POLICY IF EXISTS "trainer_bookings_select_participant_or_admin" ON public.trainer_bookings;
CREATE POLICY "trainer_bookings_select_participant_or_admin"
ON public.trainer_bookings
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    JOIN public.providers p ON p.profile_id = t.user_id AND p.provider_kind IN ('trainer', 'mixed')
    WHERE t.id = trainer_bookings.trainer_id
      AND public.owns_provider(p.id)
  )
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    WHERE t.id = trainer_bookings.trainer_id
      AND t.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "trainer_bookings_insert_self_or_admin" ON public.trainer_bookings;
CREATE POLICY "trainer_bookings_insert_self_or_admin"
ON public.trainer_bookings
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
  OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "trainer_bookings_update_provider_or_admin" ON public.trainer_bookings;
CREATE POLICY "trainer_bookings_update_provider_or_admin"
ON public.trainer_bookings
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    JOIN public.providers p ON p.profile_id = t.user_id AND p.provider_kind IN ('trainer', 'mixed')
    WHERE t.id = trainer_bookings.trainer_id
      AND public.owns_provider(p.id)
  )
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    WHERE t.id = trainer_bookings.trainer_id
      AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    JOIN public.providers p ON p.profile_id = t.user_id AND p.provider_kind IN ('trainer', 'mixed')
    WHERE t.id = trainer_bookings.trainer_id
      AND public.owns_provider(p.id)
  )
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    WHERE t.id = trainer_bookings.trainer_id
      AND t.user_id = auth.uid()
  )
);
