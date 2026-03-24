-- Šapica Pet Sitting Marketplace — Initial Schema

-- Enums
CREATE TYPE user_role AS ENUM ('owner', 'sitter', 'both');
CREATE TYPE pet_species AS ENUM ('dog', 'cat', 'bird', 'reptile', 'other');
CREATE TYPE pet_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE service_type AS ENUM ('walking', 'boarding', 'daycare', 'house_sitting');

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'owner',
  phone TEXT,
  bio TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pets
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species pet_species NOT NULL DEFAULT 'dog',
  breed TEXT,
  age_years INTEGER,
  size pet_size NOT NULL DEFAULT 'medium',
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sitter profiles
CREATE TABLE sitter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  services TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  availability JSONB DEFAULT '{}',
  radius_km INTEGER DEFAULT 10,
  description TEXT,
  experience_years INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_sitter_profiles_user ON sitter_profiles(user_id);
CREATE INDEX idx_bookings_owner ON bookings(owner_id);
CREATE INDEX idx_bookings_sitter ON bookings(sitter_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_sitter_profiles_rating ON sitter_profiles(rating_avg DESC);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER sitter_profiles_updated_at BEFORE UPDATE ON sitter_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read profiles, only own user can update
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Pets: owners manage their own pets, everyone can view
CREATE POLICY "Pets are viewable by everyone" ON pets FOR SELECT USING (true);
CREATE POLICY "Owners can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own pets" ON pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own pets" ON pets FOR DELETE USING (auth.uid() = owner_id);

-- Sitter profiles: everyone can view, sitter manages own
CREATE POLICY "Sitter profiles viewable by everyone" ON sitter_profiles FOR SELECT USING (true);
CREATE POLICY "Sitters can insert own profile" ON sitter_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sitters can update own profile" ON sitter_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Sitters can delete own profile" ON sitter_profiles FOR DELETE USING (auth.uid() = user_id);

-- Bookings: owner and sitter can view their bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = sitter_id);
CREATE POLICY "Owners can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Booking participants can update" ON bookings FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

-- Reviews: everyone can read, reviewer can create
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviewers can insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Messages: only sender and receiver
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can mark as read" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Function to update sitter rating after review
CREATE OR REPLACE FUNCTION update_sitter_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sitter_profiles
  SET
    rating_avg = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id)
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_sitter_rating();
