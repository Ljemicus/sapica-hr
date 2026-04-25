-- No-op safeguard for archived stale RLS hardening migration.
-- These DROP statements are guarded because some legacy target tables no longer exist.

DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own profile" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view public profiles" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own profile" ON public.users';
  END IF;

  IF to_regclass('public.pets') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Owners can view own pets" ON public.pets';
    EXECUTE 'DROP POLICY IF EXISTS "Owners can insert own pets" ON public.pets';
    EXECUTE 'DROP POLICY IF EXISTS "Owners can update own pets" ON public.pets';
    EXECUTE 'DROP POLICY IF EXISTS "Owners can delete own pets" ON public.pets';
  END IF;

  IF to_regclass('public.sitter_profiles') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public can view verified sitter profiles" ON public.sitter_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Sitters can view own full profile" ON public.sitter_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Sitters can create own profile" ON public.sitter_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Sitters can update own profile" ON public.sitter_profiles';
  END IF;

  IF to_regclass('public.bookings') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Owners can view own bookings" ON public.bookings';
    EXECUTE 'DROP POLICY IF EXISTS "Sitters can view bookings for their services" ON public.bookings';
    EXECUTE 'DROP POLICY IF EXISTS "Owners can create bookings" ON public.bookings';
    EXECUTE 'DROP POLICY IF EXISTS "Participants can update bookings" ON public.bookings';
  END IF;

  IF to_regclass('public.reviews') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public can view reviews for verified providers" ON public.reviews';
    EXECUTE 'DROP POLICY IF EXISTS "Verified owners can create reviews" ON public.reviews';
  END IF;
END $$;
