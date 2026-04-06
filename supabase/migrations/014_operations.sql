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
