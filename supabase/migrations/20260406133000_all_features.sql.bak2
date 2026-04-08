-- Emergency Vet Clinics table
CREATE TABLE public.emergency_vet_clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  is_24h BOOLEAN DEFAULT FALSE,
  services TEXT[] DEFAULT '{}',
  coordinates JSONB, -- { lat: number, lng: number }
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for city filtering
CREATE INDEX idx_emergency_vet_clinics_city ON public.emergency_vet_clinics(city);
CREATE INDEX idx_emergency_vet_clinics_active ON public.emergency_vet_clinics(is_active);

-- RLS policies
ALTER TABLE public.emergency_vet_clinics ENABLE ROW LEVEL SECURITY;

-- Everyone can read active clinics
CREATE POLICY "Anyone can view active emergency vet clinics"
  ON public.emergency_vet_clinics
  FOR SELECT
  USING (is_active = TRUE);

-- Only admins can modify
CREATE POLICY "Only admins can modify emergency vet clinics"
  ON public.emergency_vet_clinics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Seed data for Croatia emergency vet clinics
INSERT INTO public.emergency_vet_clinics (name, address, city, phone, email, website, is_24h, services, coordinates) VALUES
-- Zagreb
('Veterinarska stanica Zagreb - Hitna pomoć', 'Heinzelova 60', 'Zagreb', '+385 1 4611 222', 'hitna@vszagreb.hr', 'https://www.vszagreb.hr', true, ARRAY['Hitna pomoć', 'Interna medicina', 'Kirurgija', 'Dijagnostika'], '{"lat": 45.815, "lng": 15.9819}'),
('Vet Centar Pantovčak', 'Pantovčak 207', 'Zagreb', '+385 1 4588 444', 'info@vetcentar.hr', 'https://www.vetcentar.hr', true, ARRAY['Hitna pomoć', 'Oftalmologija', 'Ortopedija', 'Kardiologija'], '{"lat": 45.8144, "lng": 15.978}'),
('Veterinarska ambulanta Slavonska', 'Slavonska avenija 2', 'Zagreb', '+385 1 6129 999', 'slavonska@vet-ambulanta.hr', NULL, false, ARRAY['Hitna pomoć', 'Vakcinacija', 'Pregledi'], '{"lat": 45.8006, "lng": 16.0022}'),
-- Rijeka
('Veterinarska stanica Rijeka - Hitna pomoć', 'Žabica 12', 'Rijeka', '+385 51 337 777', 'hitna@vet-rijeka.hr', 'https://www.vet-rijeka.hr', true, ARRAY['Hitna pomoć', 'Kirurgija', 'Interna medicina', 'Dijagnostika'], '{"lat": 45.3271, "lng": 14.4422}'),
('Vet Centar Rijeka', 'Martinkovac 10', 'Rijeka', '+385 51 311 555', 'info@vetcentar-rijeka.hr', NULL, true, ARRAY['Hitna pomoć', 'Stomatologija', 'Dermatologija', 'Oftalmologija'], '{"lat": 45.3433, "lng": 14.4092}'),
('Veterinarska ambulanta Kantrida', 'Kumičićeva 5', 'Rijeka', '+385 51 674 333', 'kantrida@vet-amb.hr', NULL, false, ARRAY['Pregledi', 'Vakcinacija', 'Hitna pomoć'], '{"lat": 45.3333, "lng": 14.3833}'),
-- Split
('Veterinarska stanica Split - Hitna pomoć', 'Vukovarska 100', 'Split', '+385 21 345 678', 'hitna@vetsplit.hr', 'https://www.vetsplit.hr', true, ARRAY['Hitna pomoć', 'Kirurgija', 'Interna medicina'], '{"lat": 43.5081, "lng": 16.4402}'),
('Vet Centar Split', 'Put Brodarice 12', 'Split', '+385 21 399 888', 'info@vetcentar-split.hr', NULL, false, ARRAY['Hitna pomoć', 'Dijagnostika', 'Vakcinacija'], '{"lat": 43.5147, "lng": 16.4435}'),
-- Osijek
('Veterinarska stanica Osijek - Hitna pomoć', 'Sjenjak 45', 'Osijek', '+385 31 205 555', 'hitna@vetosijek.hr', NULL, true, ARRAY['Hitna pomoć', 'Kirurgija', 'Interna medicina'], '{"lat": 45.5511, "lng": 18.6939}'),
-- Pula
('Veterinarska ambulanta Pula - Hitna pomoć', 'Scalierova 12', 'Pula', '+385 52 211 333', 'hitna@vetpula.hr', NULL, true, ARRAY['Hitna pomoć', 'Pregledi', 'Vakcinacija'], '{"lat": 44.8666, "lng": 13.8496}'),
-- Zadar
('Vet Centar Zadar', 'Obala kralja Petra Krešimira IV 12', 'Zadar', '+385 23 251 999', 'info@vetzadar.hr', NULL, false, ARRAY['Hitna pomoć', 'Dijagnostika', 'Kirurgija'], '{"lat": 44.1194, "lng": 15.2314}'),
-- Dubrovnik
('Veterinarska stanica Dubrovnik', 'Pera Čingrije 12', 'Dubrovnik', '+385 20 423 333', 'info@vetdubrovnik.hr', NULL, false, ARRAY['Hitna pomoć', 'Pregledi', 'Vakcinacija'], '{"lat": 42.6507, "lng": 18.0944}');
-- SMS notifications table
CREATE TABLE public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sms_enabled BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verification_code TEXT,
  phone_verification_expires_at TIMESTAMPTZ,
  booking_confirmed_sms BOOLEAN DEFAULT TRUE,
  booking_reminder_sms BOOLEAN DEFAULT TRUE,
  booking_cancelled_sms BOOLEAN DEFAULT TRUE,
  message_received_sms BOOLEAN DEFAULT TRUE,
  marketing_sms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- SMS logs table
CREATE TABLE public.sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  body TEXT NOT NULL,
  template TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'delivered', 'undelivered')),
  provider_message_id TEXT,
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_sms_logs_user_id ON public.sms_logs(user_id);
CREATE INDEX idx_sms_logs_status ON public.sms_logs(status);
CREATE INDEX idx_sms_logs_sent_at ON public.sms_logs(sent_at);

-- RLS policies
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own notification preferences
CREATE POLICY "Users can manage their own notification preferences"
  ON public.user_notifications
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can read their own SMS logs
CREATE POLICY "Users can view their own SMS logs"
  ON public.sms_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all SMS logs
CREATE POLICY "Admins can view all SMS logs"
  ON public.sms_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Trigger to create default notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_user_notifications()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_create_notifications
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_notifications();

-- Backfill existing users
INSERT INTO public.user_notifications (user_id)
SELECT id FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_notifications WHERE user_notifications.user_id = users.id
);
-- AI Matching cache table for storing pre-computed matches
CREATE TABLE public.matching_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  sitter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('boarding', 'walking', 'house-sitting', 'drop-in', 'daycare')),
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  location_score INTEGER NOT NULL CHECK (location_score >= 0 AND location_score <= 100),
  availability_score INTEGER NOT NULL CHECK (availability_score >= 0 AND availability_score <= 100),
  experience_score INTEGER NOT NULL CHECK (experience_score >= 0 AND experience_score <= 100),
  rating_score INTEGER NOT NULL CHECK (rating_score >= 0 AND rating_score <= 100),
  price_score INTEGER NOT NULL CHECK (price_score >= 0 AND price_score <= 100),
  special_needs_score INTEGER NOT NULL CHECK (special_needs_score >= 0 AND special_needs_score <= 100),
  reasons TEXT[] DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(pet_id, sitter_id, service_type)
);

-- Indexes for efficient queries
CREATE INDEX idx_matching_scores_pet_id ON public.matching_scores(pet_id);
CREATE INDEX idx_matching_scores_sitter_id ON public.matching_scores(sitter_id);
CREATE INDEX idx_matching_scores_service ON public.matching_scores(service_type);
CREATE INDEX idx_matching_scores_total ON public.matching_scores(total_score DESC);
CREATE INDEX idx_matching_scores_expires ON public.matching_scores(expires_at);

-- Composite index for common query pattern
CREATE INDEX idx_matching_scores_lookup ON public.matching_scores(pet_id, service_type, total_score DESC);

-- RLS policies
ALTER TABLE public.matching_scores ENABLE ROW LEVEL SECURITY;

-- Users can view matching scores for their own pets
CREATE POLICY "Users can view matching scores for their pets"
  ON public.matching_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = matching_scores.pet_id AND pets.owner_id = auth.uid()
    )
  );

-- Admins can view all matching scores
CREATE POLICY "Admins can view all matching scores"
  ON public.matching_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Function to clean expired matching scores
CREATE OR REPLACE FUNCTION public.clean_expired_matching_scores()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.matching_scores
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to compute matching score for a pet-sitter pair
CREATE OR REPLACE FUNCTION public.compute_matching_score(
  p_pet_id UUID,
  p_sitter_id UUID,
  p_service_type TEXT
)
RETURNS TABLE (
  total_score INTEGER,
  location_score INTEGER,
  availability_score INTEGER,
  experience_score INTEGER,
  rating_score INTEGER,
  price_score INTEGER,
  special_needs_score INTEGER,
  reasons TEXT[]
) AS $$
DECLARE
  v_pet RECORD;
  v_sitter RECORD;
  v_owner RECORD;
  v_location_score INTEGER := 50;
  v_availability_score INTEGER := 80;
  v_experience_score INTEGER := 50;
  v_rating_score INTEGER := 50;
  v_price_score INTEGER := 50;
  v_special_needs_score INTEGER := 50;
  v_reasons TEXT[] := '{}';
  v_total INTEGER;
BEGIN
  -- Get pet details
  SELECT * INTO v_pet FROM public.pets WHERE id = p_pet_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get sitter details
  SELECT sp.*, u.* INTO v_sitter
  FROM public.sitter_profiles sp
  JOIN public.users u ON u.id = sp.user_id
  WHERE sp.user_id = p_sitter_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get owner details
  SELECT * INTO v_owner FROM public.users WHERE id = v_pet.owner_id;
  
  -- Location score (city match)
  IF v_sitter.city IS NOT NULL AND v_owner.city IS NOT NULL THEN
    IF LOWER(v_sitter.city) = LOWER(v_owner.city) THEN
      v_location_score := 80;
      v_reasons := array_append(v_reasons, 'U istom gradu');
    ELSE
      v_location_score := 40;
    END IF;
  END IF;
  
  -- Experience score
  IF v_sitter.experience_years >= 5 THEN
    v_experience_score := v_experience_score + 20;
    v_reasons := array_append(v_reasons, '5+ godina iskustva');
  ELSIF v_sitter.experience_years >= 2 THEN
    v_experience_score := v_experience_score + 10;
  END IF;
  
  -- Rating score
  v_rating_score := LEAST(100, ROUND((v_sitter.rating_avg / 5.0) * 60 + LEAST(40, v_sitter.review_count * 0.8))::INTEGER);
  
  IF v_sitter.rating_avg >= 4.5 THEN
    v_reasons := array_append(v_reasons, '⭐ Visoka ocjena');
  END IF;
  
  IF v_sitter.superhost THEN
    v_rating_score := v_rating_score + 10;
    v_reasons := array_append(v_reasons, '⭐ Superhost');
  END IF;
  
  -- Price score
  IF v_sitter.prices->p_service_type IS NOT NULL THEN
    v_price_score := 80;
  ELSE
    v_price_score := 0;
  END IF;
  
  -- Special needs score
  IF v_pet.special_needs IS NULL OR v_pet.special_needs = '' THEN
    v_special_needs_score := 100;
  ELSE
    v_special_needs_score := 60;
    IF v_sitter.verified THEN
      v_special_needs_score := v_special_needs_score + 20;
    END IF;
  END IF;
  
  -- Calculate total (weighted)
  v_total := ROUND(
    v_location_score * 0.25 +
    v_availability_score * 0.20 +
    v_experience_score * 0.20 +
    v_rating_score * 0.15 +
    v_price_score * 0.10 +
    v_special_needs_score * 0.10
  )::INTEGER;
  
  RETURN QUERY SELECT 
    v_total,
    v_location_score,
    v_availability_score,
    v_experience_score,
    v_rating_score,
    v_price_score,
    v_special_needs_score,
    v_reasons;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron job to clean expired scores (would be set up via pg_cron or external scheduler)
COMMENT ON FUNCTION public.clean_expired_matching_scores() IS 
  'Remove expired matching score cache entries. Run daily via cron.';
-- Pet Photo Contests system
CREATE TABLE public.photo_contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,
  cover_image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  voting_end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'voting', 'closed')),
  max_entries_per_user INTEGER DEFAULT 1,
  prize_description TEXT,
  prize_image_url TEXT,
  rules TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contest entries
CREATE TABLE public.contest_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID REFERENCES public.photo_contests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  votes_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  is_disqualified BOOLEAN DEFAULT FALSE,
  disqualification_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

-- Votes
CREATE TABLE public.contest_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES public.contest_entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id, user_id)
);

-- Community Challenges
CREATE TABLE public.community_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('walks', 'bookings', 'photos', 'reviews', 'referrals')),
  target_count INTEGER NOT NULL,
  reward_badge_id UUID,
  reward_points INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE public.user_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.community_challenges(id) ON DELETE CASCADE NOT NULL,
  current_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Badges
CREATE TABLE public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  icon_emoji TEXT,
  color TEXT,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('bookings_count', 'reviews_count', 'walks_count', 'photos_count', 'referrals_count', 'challenge_completion')),
  requirement_count INTEGER NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges
CREATE TABLE public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Pet Diary
CREATE TABLE public.pet_journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('milestone', 'health', 'behavior', 'photo', 'note')),
  title TEXT,
  content TEXT,
  image_url TEXT,
  event_date DATE,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet milestones
CREATE TABLE public.pet_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('birthday', 'adoption_day', 'first_walk', 'first_vaccination', 'training_complete', 'weight_goal', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  milestone_date DATE NOT NULL,
  is_celebrated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_photo_contests_status ON public.photo_contests(status);
CREATE INDEX idx_contest_entries_contest ON public.contest_entries(contest_id);
CREATE INDEX idx_contest_votes_entry ON public.contest_votes(entry_id);
CREATE INDEX idx_user_challenges_user ON public.user_challenges(user_id);
CREATE INDEX idx_pet_journal_pet ON public.pet_journal_entries(pet_id);
CREATE INDEX idx_pet_milestones_pet ON public.pet_milestones(pet_id);

-- RLS
ALTER TABLE public.photo_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active contests" ON public.photo_contests FOR SELECT USING (status IN ('active', 'voting', 'closed'));
CREATE POLICY "Users can manage their own entries" ON public.contest_entries FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can vote" ON public.contest_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can view their challenges" ON public.user_challenges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their pet journal" ON public.pet_journal_entries FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their milestones" ON public.pet_milestones FOR ALL USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = pet_milestones.pet_id AND pets.owner_id = auth.uid()));
-- Sitter Verification Flow
CREATE TABLE public.sitter_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  
  -- Identity verification
  id_document_type TEXT CHECK (id_document_type IN ('passport', 'id_card', 'drivers_license')),
  id_document_number TEXT,
  id_document_front_url TEXT,
  id_document_back_url TEXT,
  id_verified_at TIMESTAMPTZ,
  id_verified_by UUID REFERENCES public.users(id),
  
  -- Address verification
  address_proof_type TEXT CHECK (address_proof_type IN ('utility_bill', 'bank_statement', 'government_letter')),
  address_proof_url TEXT,
  address_verified_at TIMESTAMPTZ,
  address_verified_by UUID REFERENCES public.users(id),
  
  -- Background check
  background_check_status TEXT CHECK (background_check_status IN ('not_started', 'pending', 'clear', 'flagged')),
  background_check_report_url TEXT,
  background_checked_at TIMESTAMPTZ,
  background_checked_by UUID REFERENCES public.users(id),
  
  -- Video interview
  video_interview_url TEXT,
  video_interview_status TEXT CHECK (video_interview_status IN ('not_started', 'scheduled', 'completed', 'approved')),
  video_interview_scheduled_at TIMESTAMPTZ,
  video_interview_completed_at TIMESTAMPTZ,
  
  -- References
  reference_1_name TEXT,
  reference_1_phone TEXT,
  reference_1_email TEXT,
  reference_1_verified BOOLEAN DEFAULT FALSE,
  reference_2_name TEXT,
  reference_2_phone TEXT,
  reference_2_email TEXT,
  reference_2_verified BOOLEAN DEFAULT FALSE,
  
  -- Admin notes
  admin_notes TEXT,
  rejection_reason TEXT,
  
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sitter_id)
);

-- Dispute Resolution System
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'mediation', 'resolved', 'closed');
CREATE TYPE dispute_reason AS ENUM ('no_show', 'damages', 'pet_injury', 'payment_issue', 'service_not_as_described', 'cancellation_dispute', 'other');
CREATE TYPE dispute_resolution AS ENUM ('refund_full', 'refund_partial', 'no_refund', 'reschedule', 'other');

CREATE TABLE public.disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  
  -- Who opened the dispute
  opened_by UUID REFERENCES public.users(id) NOT NULL,
  opened_by_role TEXT NOT NULL CHECK (opened_by_role IN ('owner', 'sitter')),
  
  -- Dispute details
  reason dispute_reason NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  
  -- Status tracking
  status dispute_status DEFAULT 'open',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Resolution
  resolution dispute_resolution,
  resolution_notes TEXT,
  refund_amount DECIMAL(10,2),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id),
  
  -- Escrow/funds holding
  funds_held BOOLEAN DEFAULT FALSE,
  funds_released BOOLEAN DEFAULT FALSE,
  funds_released_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispute messages (for communication during resolution)
CREATE TABLE public.dispute_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- internal admin notes vs visible to parties
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance claims
CREATE TABLE public.insurance_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('vet_bills', 'property_damage', 'theft', 'liability', 'other')),
  
  -- Incident details
  incident_date DATE NOT NULL,
  incident_description TEXT NOT NULL,
  incident_location TEXT,
  
  -- Financial
  claimed_amount DECIMAL(10,2) NOT NULL,
  approved_amount DECIMAL(10,2),
  deductible_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Documentation
  vet_bills_urls TEXT[] DEFAULT '{}',
  photos_urls TEXT[] DEFAULT '{}',
  police_report_url TEXT,
  other_documents_urls TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'paid')),
  
  -- Review
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id),
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Payment
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sitter_verifications_status ON public.sitter_verifications(status);
CREATE INDEX idx_sitter_verifications_sitter ON public.sitter_verifications(sitter_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_disputes_booking ON public.disputes(booking_id);
CREATE INDEX idx_disputes_opened_by ON public.disputes(opened_by);
CREATE INDEX idx_dispute_messages_dispute ON public.dispute_messages(dispute_id);
CREATE INDEX idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX idx_insurance_claims_user ON public.insurance_claims(user_id);

-- RLS
ALTER TABLE public.sitter_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

-- Sitters can view their own verification
CREATE POLICY "Sitters can view own verification" ON public.sitter_verifications FOR SELECT USING (sitter_id = auth.uid());
-- Admins can manage all
CREATE POLICY "Admins can manage verifications" ON public.sitter_verifications FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Dispute policies
CREATE POLICY "Parties can view their disputes" ON public.disputes FOR SELECT USING (opened_by = auth.uid() OR EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = disputes.booking_id AND (bookings.owner_id = auth.uid() OR bookings.sitter_id = auth.uid())));
CREATE POLICY "Admins can manage disputes" ON public.disputes FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Messages
CREATE POLICY "Parties can view dispute messages" ON public.dispute_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.disputes WHERE disputes.id = dispute_messages.dispute_id AND (disputes.opened_by = auth.uid() OR dispute_messages.is_internal = FALSE)));
CREATE POLICY "Admins can manage messages" ON public.dispute_messages FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Insurance
CREATE POLICY "Users can manage their claims" ON public.insurance_claims FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all claims" ON public.insurance_claims FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));
-- Sitter Performance Analytics
CREATE TABLE public.sitter_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Performance metrics (updated daily via cron)
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  
  -- Booking metrics
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  no_show_bookings INTEGER DEFAULT 0,
  
  -- Financial metrics
  total_earnings DECIMAL(10,2) DEFAULT 0,
  platform_fees_paid DECIMAL(10,2) DEFAULT 0,
  average_booking_value DECIMAL(10,2) DEFAULT 0,
  
  -- Response metrics
  avg_response_time_minutes INTEGER, -- how fast they respond to inquiries
  response_rate DECIMAL(5,2), -- percentage of inquiries responded to
  acceptance_rate DECIMAL(5,2), -- percentage of bookings accepted
  
  -- Review metrics
  new_reviews INTEGER DEFAULT 0,
  avg_rating_period DECIMAL(3,2),
  
  -- Engagement
  profile_views INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  
  -- Calculated score (0-100)
  performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sitter_id, period_start, period_type)
);

-- Review Sentiment Analysis (cached results)
CREATE TABLE public.review_sentiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  
  -- Sentiment scores (0-1)
  overall_sentiment DECIMAL(3,2) NOT NULL, -- -1 to 1, negative to positive
  sentiment_label TEXT NOT NULL CHECK (sentiment_label IN ('very_negative', 'negative', 'neutral', 'positive', 'very_positive')),
  
  -- Aspect-based sentiment
  communication_score DECIMAL(3,2), -- how they communicate
  reliability_score DECIMAL(3,2), -- showed up, on time
  care_quality_score DECIMAL(3,2), -- how they treated the pet
  cleanliness_score DECIMAL(3,2), -- left place clean
  value_score DECIMAL(3,2), -- worth the price
  
  -- Key phrases extracted
  positive_phrases TEXT[] DEFAULT '{}',
  negative_phrases TEXT[] DEFAULT '{}',
  
  -- Flags for manual review
  requires_manual_review BOOLEAN DEFAULT FALSE,
  review_reason TEXT, -- why it needs review (inappropriate, suspicious, etc)
  
  -- Processing
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_by TEXT DEFAULT 'ai', -- 'ai' or 'manual'
  
  UNIQUE(review_id)
);

-- Fraud Detection
CREATE TABLE public.fraud_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- What triggered the alert
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'suspicious_booking_pattern', -- many bookings cancelled
    'payment_fraud', -- chargebacks, failed payments
    'fake_reviews', -- review manipulation
    'identity_mismatch', -- ID doesn't match user
    'location_spoofing', -- GPS manipulation
    'duplicate_accounts', -- same person, multiple accounts
    'unusual_activity', -- generic catch-all
    'chargeback_risk' -- high risk of chargeback
  )),
  
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'confirmed_fraud', 'false_positive', 'resolved')),
  
  -- Related entities
  user_id UUID REFERENCES public.users(id),
  booking_id UUID REFERENCES public.bookings(id),
  review_id UUID REFERENCES public.reviews(id),
  
  -- Alert details
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '{}', -- structured evidence
  
  -- Risk scoring
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id),
  resolution_notes TEXT,
  action_taken TEXT, -- what was done (banned, warned, etc)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fraud detection rules (for automated scanning)
CREATE TABLE public.fraud_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  alert_type TEXT NOT NULL,
  
  -- Rule conditions (stored as query or structured JSON)
  conditions JSONB NOT NULL, -- e.g., {"cancelled_bookings": "> 5", "timeframe": "7_days"}
  
  -- Risk scoring
  risk_score_increment INTEGER NOT NULL, -- how much to add to risk score
  auto_flag BOOLEAN DEFAULT FALSE, -- auto-create alert if triggered
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trust Score (composite score for users)
CREATE TABLE public.user_trust_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Component scores (0-100)
  identity_score INTEGER DEFAULT 50, -- verified ID, phone, email
  behavior_score INTEGER DEFAULT 50, -- booking history, cancellations
  review_score INTEGER DEFAULT 50, -- quality of reviews given/received
  payment_score INTEGER DEFAULT 50, -- payment history, chargebacks
  community_score INTEGER DEFAULT 50, -- reports, disputes
  
  -- Composite
  overall_trust_score INTEGER GENERATED ALWAYS AS (
    (identity_score + behavior_score + review_score + payment_score + community_score) / 5
  ) STORED,
  
  trust_level TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (identity_score + behavior_score + review_score + payment_score + community_score) / 5 >= 80 THEN 'high'
      WHEN (identity_score + behavior_score + review_score + payment_score + community_score) / 5 >= 60 THEN 'medium'
      WHEN (identity_score + behavior_score + review_score + payment_score + community_score) / 5 >= 40 THEN 'low'
      ELSE 'very_low'
    END
  ) STORED,
  
  -- Factors affecting score
  positive_factors TEXT[] DEFAULT '{}',
  negative_factors TEXT[] DEFAULT '{}',
  
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_sitter_analytics_sitter ON public.sitter_analytics(sitter_id);
CREATE INDEX idx_sitter_analytics_period ON public.sitter_analytics(period_start, period_type);
CREATE INDEX idx_review_sentiments_review ON public.review_sentiments(review_id);
CREATE INDEX idx_review_sentiments_manual ON public.review_sentiments(requires_manual_review) WHERE requires_manual_review = TRUE;
CREATE INDEX idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX idx_fraud_alerts_severity ON public.fraud_alerts(severity);
CREATE INDEX idx_fraud_alerts_user ON public.fraud_alerts(user_id);
CREATE INDEX idx_fraud_rules_active ON public.fraud_rules(is_active);
CREATE INDEX idx_user_trust_scores_overall ON public.user_trust_scores(overall_trust_score);
CREATE INDEX idx_user_trust_scores_user ON public.user_trust_scores(user_id);

-- RLS
ALTER TABLE public.sitter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_sentiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trust_scores ENABLE ROW LEVEL SECURITY;

-- Sitters can view their own analytics
CREATE POLICY "Sitters can view own analytics" ON public.sitter_analytics FOR SELECT USING (sitter_id = auth.uid());

-- Admins can manage everything
CREATE POLICY "Admins manage analytics" ON public.sitter_analytics FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));
CREATE POLICY "Admins manage sentiments" ON public.review_sentiments FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));
CREATE POLICY "Admins manage fraud" ON public.fraud_alerts FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));
CREATE POLICY "Admins manage fraud rules" ON public.fraud_rules FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));
CREATE POLICY "Admins manage trust scores" ON public.user_trust_scores FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Users can view their own trust score
CREATE POLICY "Users can view own trust score" ON public.user_trust_scores FOR SELECT USING (user_id = auth.uid());

-- Seed fraud rules
INSERT INTO public.fraud_rules (name, description, alert_type, conditions, risk_score_increment, auto_flag) VALUES
('Multiple Cancellations', 'User cancelled more than 3 bookings in 7 days', 'suspicious_booking_pattern', '{"cancelled_bookings": "> 3", "timeframe": "7_days"}', 30, true),
('Chargeback History', 'User has previous chargebacks', 'payment_fraud', '{"chargeback_count": "> 0"}', 50, true),
('Duplicate Reviews', 'User reviewing same sitter multiple times', 'fake_reviews', '{"reviews_to_same_sitter": "> 1", "timeframe": "30_days"}', 25, true),
('Rapid Bookings', 'More than 5 bookings in 24 hours', 'suspicious_booking_pattern', '{"booking_count": "> 5", "timeframe": "24_hours"}', 20, false),
('Unusual Location', 'Booking from unusual location for user', 'location_spoofing', '{"location_deviation_km": "> 100"}', 35, false);
