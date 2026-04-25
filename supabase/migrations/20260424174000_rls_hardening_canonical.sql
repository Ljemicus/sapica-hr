-- Canonical RLS hardening aligned to live schema truth as of 2026-04-24.
-- Replaces archived stale migration assumptions (`public.users`, `owner_id`, `sitter_id`, legacy sitter_profiles ownership).

-- Safety cleanup for any stray old-style policy names that may exist.
DROP POLICY IF EXISTS "Owners can view own pets" ON public.pets;
DROP POLICY IF EXISTS "Owners can insert own pets" ON public.pets;
DROP POLICY IF EXISTS "Owners can update own pets" ON public.pets;
DROP POLICY IF EXISTS "Owners can delete own pets" ON public.pets;
DROP POLICY IF EXISTS "Owners can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Sitters can view bookings for their services" ON public.bookings;
DROP POLICY IF EXISTS "Owners can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Participants can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can view reviews for verified providers" ON public.reviews;
DROP POLICY IF EXISTS "Verified owners can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Canonical tables already have live policy coverage verified in recovery dumps.
-- This migration intentionally remains conservative: it only adds missing canonical guards
-- and avoids rewriting verified-good policies blindly.

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pets ENABLE ROW LEVEL SECURITY;

-- Canonical helper-backed policy additions only if absent names are missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_self_or_admin'
  ) THEN
    CREATE POLICY "profiles_select_self_or_admin"
      ON public.profiles FOR SELECT
      USING ((auth.uid() = id) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_update_self_or_admin'
  ) THEN
    CREATE POLICY "profiles_update_self_or_admin"
      ON public.profiles FOR UPDATE
      USING ((auth.uid() = id) OR public.is_admin())
      WITH CHECK ((auth.uid() = id) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_insert_self'
  ) THEN
    CREATE POLICY "profiles_insert_self"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pets' AND policyname = 'pets_select_owner_provider_or_admin'
  ) THEN
    CREATE POLICY "pets_select_owner_provider_or_admin"
      ON public.pets FOR SELECT
      USING ((auth.uid() = owner_profile_id) OR public.can_provider_view_pet(id) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pets' AND policyname = 'pets_insert_owner_or_admin'
  ) THEN
    CREATE POLICY "pets_insert_owner_or_admin"
      ON public.pets FOR INSERT
      WITH CHECK ((auth.uid() = owner_profile_id) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pets' AND policyname = 'pets_update_owner_or_admin'
  ) THEN
    CREATE POLICY "pets_update_owner_or_admin"
      ON public.pets FOR UPDATE
      USING ((auth.uid() = owner_profile_id) OR public.is_admin())
      WITH CHECK ((auth.uid() = owner_profile_id) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pets' AND policyname = 'pets_delete_owner_or_admin'
  ) THEN
    CREATE POLICY "pets_delete_owner_or_admin"
      ON public.pets FOR DELETE
      USING ((auth.uid() = owner_profile_id) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'bookings_select_participant_or_admin'
  ) THEN
    CREATE POLICY "bookings_select_participant_or_admin"
      ON public.bookings FOR SELECT
      USING ((owner_profile_id = auth.uid()) OR public.owns_provider(provider_id) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'bookings_insert_owner_or_admin'
  ) THEN
    CREATE POLICY "bookings_insert_owner_or_admin"
      ON public.bookings FOR INSERT
      WITH CHECK ((owner_profile_id = auth.uid()) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'bookings_update_participant_or_admin'
  ) THEN
    CREATE POLICY "bookings_update_participant_or_admin"
      ON public.bookings FOR UPDATE
      USING ((owner_profile_id = auth.uid()) OR public.owns_provider(provider_id) OR public.is_admin())
      WITH CHECK ((owner_profile_id = auth.uid()) OR public.owns_provider(provider_id) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'payments_select_participant_or_admin'
  ) THEN
    CREATE POLICY "payments_select_participant_or_admin"
      ON public.payments FOR SELECT
      USING (public.is_booking_participant(booking_id) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'payments_manage_provider_or_admin'
  ) THEN
    CREATE POLICY "payments_manage_provider_or_admin"
      ON public.payments
      USING (public.owns_provider(provider_id) OR public.is_admin())
      WITH CHECK (public.owns_provider(provider_id) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_public_or_participant_or_admin'
  ) THEN
    CREATE POLICY "reviews_public_or_participant_or_admin"
      ON public.reviews FOR SELECT
      USING ((status = 'published') OR (reviewer_profile_id = auth.uid()) OR (reviewee_profile_id = auth.uid()) OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_insert_completed_booking_participant_or_admin'
  ) THEN
    CREATE POLICY "reviews_insert_completed_booking_participant_or_admin"
      ON public.reviews FOR INSERT
      WITH CHECK (
        (reviewer_profile_id = auth.uid() AND EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.id = booking_id
            AND b.status = 'completed'
            AND (b.owner_profile_id = auth.uid() OR public.owns_provider(b.provider_id) OR public.is_admin())
        )) OR public.is_admin()
      );
  END IF;
END $$;
