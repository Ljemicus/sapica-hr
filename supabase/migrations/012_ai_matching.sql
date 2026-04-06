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
