-- Cycle 2 follow-up: enable and harden remaining trainer-table RLS
-- Revised after live apply exposed trainer_reviews column drift (no user_id live).

alter table if exists public.trainers enable row level security;
alter table if exists public.training_programs enable row level security;
alter table if exists public.trainer_reviews enable row level security;
alter table if exists public.trainer_availability enable row level security;

DROP POLICY IF EXISTS "trainers_public_read" ON public.trainers;
CREATE POLICY "trainers_public_read"
ON public.trainers
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "trainers_insert_owner_or_admin" ON public.trainers;
CREATE POLICY "trainers_insert_owner_or_admin"
ON public.trainers
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
  OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "trainers_update_owner_or_admin" ON public.trainers;
CREATE POLICY "trainers_update_owner_or_admin"
ON public.trainers
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR auth.uid() = user_id
)
WITH CHECK (
  public.is_admin()
  OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "training_programs_public_read" ON public.training_programs;
CREATE POLICY "training_programs_public_read"
ON public.training_programs
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "training_programs_manage_owner_or_admin" ON public.training_programs;
CREATE POLICY "training_programs_manage_owner_or_admin"
ON public.training_programs
FOR ALL
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    JOIN public.providers p ON p.profile_id = t.user_id AND p.provider_kind IN ('trainer', 'mixed')
    WHERE t.id = training_programs.trainer_id
      AND public.owns_provider(p.id)
  )
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    WHERE t.id = training_programs.trainer_id
      AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    JOIN public.providers p ON p.profile_id = t.user_id AND p.provider_kind IN ('trainer', 'mixed')
    WHERE t.id = training_programs.trainer_id
      AND public.owns_provider(p.id)
  )
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    WHERE t.id = training_programs.trainer_id
      AND t.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "trainer_reviews_public_read" ON public.trainer_reviews;
CREATE POLICY "trainer_reviews_public_read"
ON public.trainer_reviews
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "trainer_reviews_insert_authenticated_or_admin" ON public.trainer_reviews;
CREATE POLICY "trainer_reviews_insert_authenticated_or_admin"
ON public.trainer_reviews
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "trainer_reviews_update_admin_only" ON public.trainer_reviews;
CREATE POLICY "trainer_reviews_update_admin_only"
ON public.trainer_reviews
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "trainer_reviews_delete_admin_only" ON public.trainer_reviews;
CREATE POLICY "trainer_reviews_delete_admin_only"
ON public.trainer_reviews
FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "trainer_availability_public_read" ON public.trainer_availability;
CREATE POLICY "trainer_availability_public_read"
ON public.trainer_availability
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "trainer_availability_manage_owner_or_admin" ON public.trainer_availability;
CREATE POLICY "trainer_availability_manage_owner_or_admin"
ON public.trainer_availability
FOR ALL
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    JOIN public.providers p ON p.profile_id = t.user_id AND p.provider_kind IN ('trainer', 'mixed')
    WHERE t.id = trainer_availability.trainer_id
      AND public.owns_provider(p.id)
  )
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    WHERE t.id = trainer_availability.trainer_id
      AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    JOIN public.providers p ON p.profile_id = t.user_id AND p.provider_kind IN ('trainer', 'mixed')
    WHERE t.id = trainer_availability.trainer_id
      AND public.owns_provider(p.id)
  )
  OR EXISTS (
    SELECT 1
    FROM public.trainers t
    WHERE t.id = trainer_availability.trainer_id
      AND t.user_id = auth.uid()
  )
);
