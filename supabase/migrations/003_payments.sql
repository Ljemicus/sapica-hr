-- ════════════════════════════════════════════════════════
-- PetPark — Payment infrastructure (Stripe Connect)
-- ════════════════════════════════════════════════════════

-- Add Stripe fields to sitter_profiles
ALTER TABLE public.sitter_profiles 
  ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS payout_enabled BOOLEAN DEFAULT FALSE;

-- Add payment fields to bookings
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' 
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'failed')),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS platform_fee DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Payments log table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id),
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL DEFAULT 0,
  sitter_payout INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  refund_id TEXT,
  refund_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM public.bookings 
      WHERE owner_id = auth.uid() OR sitter_id = auth.uid()
    )
  );

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_pi ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_sitter_profiles_stripe ON public.sitter_profiles(stripe_account_id);
