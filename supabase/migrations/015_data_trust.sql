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
