-- Vet Reviews Migration
-- Creates tables and functions for veterinarian review system

-- Create vet_reviews table
CREATE TABLE IF NOT EXISTS vet_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vet_id UUID NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    service_type TEXT NOT NULL CHECK (service_type IN ('hitna_pomoc', 'cijepljenje', 'operacija', 'pregled', 'ponasanje', 'ostalo')),
    price_paid NUMERIC(10, 2),
    visit_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    flag_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'removed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vet_reviews_vet_id ON vet_reviews(vet_id);
CREATE INDEX IF NOT EXISTS idx_vet_reviews_user_id ON vet_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_vet_reviews_status ON vet_reviews(status);
CREATE INDEX IF NOT EXISTS idx_vet_reviews_service_type ON vet_reviews(service_type);
CREATE INDEX IF NOT EXISTS idx_vet_reviews_created_at ON vet_reviews(created_at DESC);

-- Add rating columns to veterinarians table
ALTER TABLE veterinarians 
    ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(2, 1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create function to update vet rating
CREATE OR REPLACE FUNCTION update_vet_rating(p_vet_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE veterinarians
    SET 
        rating_avg = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM vet_reviews
            WHERE vet_id = p_vet_id AND status = 'active'
        ), 0),
        review_count = COALESCE((
            SELECT COUNT(*)
            FROM vet_reviews
            WHERE vet_id = p_vet_id AND status = 'active'
        ), 0)
    WHERE id = p_vet_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get vet review stats
CREATE OR REPLACE FUNCTION get_vet_review_stats(p_vet_id UUID)
RETURNS TABLE (
    vet_id UUID,
    avg_rating NUMERIC,
    review_count BIGINT,
    rating_distribution JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_vet_id as vet_id,
        COALESCE(ROUND(AVG(vr.rating)::numeric, 1), 0) as avg_rating,
        COUNT(*) as review_count,
        COALESCE(
            JSONB_OBJECT_AGG(
                vr.rating::text,
                COUNT(*)
            ) FILTER (WHERE vr.rating IS NOT NULL),
            '{}'::jsonb
        ) as rating_distribution
    FROM vet_reviews vr
    WHERE vr.vet_id = p_vet_id AND vr.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create function to increment helpful count
CREATE OR REPLACE FUNCTION increment_review_helpful(p_review_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE vet_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = p_review_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to flag review
CREATE OR REPLACE FUNCTION flag_review(p_review_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_flag_count INTEGER;
BEGIN
    -- Insert into review_flags table (create if not exists)
    INSERT INTO vet_review_flags (review_id, user_id)
    VALUES (p_review_id, p_user_id)
    ON CONFLICT (review_id, user_id) DO NOTHING;
    
    -- Update flag count
    SELECT COUNT(*) INTO v_flag_count
    FROM vet_review_flags
    WHERE review_id = p_review_id;
    
    UPDATE vet_reviews
    SET 
        flag_count = v_flag_count,
        status = CASE WHEN v_flag_count >= 3 THEN 'flagged' ELSE status END
    WHERE id = p_review_id;
END;
$$ LANGUAGE plpgsql;

-- Create review flags table
CREATE TABLE IF NOT EXISTS vet_review_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES vet_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_vet_review_flags_review_id ON vet_review_flags(review_id);
CREATE INDEX IF NOT EXISTS idx_vet_review_flags_user_id ON vet_review_flags(user_id);

-- Enable RLS
ALTER TABLE vet_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_review_flags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Vet reviews are viewable by everyone" 
    ON vet_reviews FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create their own reviews" 
    ON vet_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
    ON vet_reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
    ON vet_reviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can flag reviews" 
    ON vet_review_flags FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vet_reviews_updated_at
    BEFORE UPDATE ON vet_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
