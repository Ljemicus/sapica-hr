-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'sitter', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pets table
CREATE TABLE public.pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
  breed TEXT,
  age INTEGER,
  weight DECIMAL,
  special_needs TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sitter profiles
CREATE TABLE public.sitter_profiles (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  services JSONB DEFAULT '[]'::jsonb,
  prices JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT FALSE,
  superhost BOOLEAN DEFAULT FALSE,
  response_time TEXT,
  rating_avg DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  location_lat DECIMAL,
  location_lng DECIMAL,
  city TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) NOT NULL,
  sitter_id UUID REFERENCES public.users(id) NOT NULL,
  pet_id UUID REFERENCES public.pets(id) NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('boarding', 'walking', 'house-sitting', 'drop-in', 'daycare')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  total_price DECIMAL NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.users(id) NOT NULL,
  reviewee_id UUID REFERENCES public.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  receiver_id UUID REFERENCES public.users(id) NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  content TEXT,
  image_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability
CREATE TABLE public.availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  UNIQUE(sitter_id, date)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users: everyone can read, users can update own
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets: everyone can read, owners can CRUD own
CREATE POLICY "Pets are viewable by everyone" ON public.pets FOR SELECT USING (true);
CREATE POLICY "Owners can insert own pets" ON public.pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own pets" ON public.pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own pets" ON public.pets FOR DELETE USING (auth.uid() = owner_id);

-- Sitter profiles: everyone can read, sitters can update own
CREATE POLICY "Sitter profiles viewable by everyone" ON public.sitter_profiles FOR SELECT USING (true);
CREATE POLICY "Sitters can insert own profile" ON public.sitter_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sitters can update own profile" ON public.sitter_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Bookings: participants can view, owners can insert
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = sitter_id);
CREATE POLICY "Owners can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Participants can update bookings" ON public.bookings FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

-- Reviews: everyone can read, reviewers can insert
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Messages: participants can view and insert
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Availability: everyone can read, sitters can manage own
CREATE POLICY "Availability viewable by everyone" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Sitters can manage own availability" ON public.availability FOR INSERT WITH CHECK (auth.uid() = sitter_id);
CREATE POLICY "Sitters can update own availability" ON public.availability FOR UPDATE USING (auth.uid() = sitter_id);
CREATE POLICY "Sitters can delete own availability" ON public.availability FOR DELETE USING (auth.uid() = sitter_id);

-- Indexes
CREATE INDEX idx_pets_owner ON public.pets(owner_id);
CREATE INDEX idx_sitter_profiles_city ON public.sitter_profiles(city);
CREATE INDEX idx_sitter_profiles_rating ON public.sitter_profiles(rating_avg DESC);
CREATE INDEX idx_bookings_owner ON public.bookings(owner_id);
CREATE INDEX idx_bookings_sitter ON public.bookings(sitter_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_messages_participants ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_messages_booking ON public.messages(booking_id);
CREATE INDEX idx_availability_sitter_date ON public.availability(sitter_id, date);

-- Function to update sitter rating
CREATE OR REPLACE FUNCTION update_sitter_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sitter_profiles
  SET rating_avg = (
    SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id
  ),
  review_count = (
    SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_sitter_rating();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
