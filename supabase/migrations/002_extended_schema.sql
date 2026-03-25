-- ============================================================
-- Extended schema: tables for walks, pet_updates, pet_passports,
-- groomers, trainers, training_programs, articles, forum, lost_pets
-- ============================================================

-- Walks (GPS tracking during bookings)
CREATE TABLE public.walks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID REFERENCES public.users(id) NOT NULL,
  pet_id UUID REFERENCES public.pets(id) NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'u_tijeku' CHECK (status IN ('u_tijeku', 'zavrsena')),
  distance_km DECIMAL DEFAULT 0,
  route JSONB DEFAULT '[]'::jsonb,
  checkpoints JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet updates (photo/video feed during bookings)
CREATE TABLE public.pet_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  sitter_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'text')),
  emoji TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet passports (health records)
CREATE TABLE public.pet_passports (
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE PRIMARY KEY,
  vaccinations JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  vet_info JSONB DEFAULT '{}'::jsonb,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groomers
CREATE TABLE public.groomers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  services JSONB DEFAULT '[]'::jsonb,
  prices JSONB DEFAULT '{}'::jsonb,
  rating DECIMAL DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  bio TEXT DEFAULT '',
  verified BOOLEAN DEFAULT FALSE,
  specialization TEXT DEFAULT 'oba' CHECK (specialization IN ('psi', 'macke', 'oba')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groomer reviews
CREATE TABLE public.groomer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  groomer_id UUID REFERENCES public.groomers(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_initial TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trainers
CREATE TABLE public.trainers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  specializations JSONB DEFAULT '[]'::jsonb,
  price_per_hour DECIMAL NOT NULL DEFAULT 0,
  certificates JSONB DEFAULT '[]'::jsonb,
  rating DECIMAL DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  bio TEXT DEFAULT '',
  certified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training programs
CREATE TABLE public.training_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('osnovna', 'napredna', 'agility', 'ponasanje', 'stenci')),
  duration_weeks INTEGER NOT NULL,
  sessions INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trainer reviews
CREATE TABLE public.trainer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_initial TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles (blog)
CREATE TABLE public.articles (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  body TEXT DEFAULT '',
  author TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('zdravlje', 'prehrana', 'dresura', 'putovanje', 'zabava')),
  emoji TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum topics
CREATE TABLE public.forum_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_slug TEXT NOT NULL CHECK (category_slug IN ('pitanja', 'savjeti', 'price', 'izgubljeni', 'slobodna')),
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_initial TEXT NOT NULL,
  author_gradient TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  last_reply_at TIMESTAMPTZ,
  last_reply_by TEXT,
  tags JSONB DEFAULT '[]'::jsonb
);

-- Forum posts/comments
CREATE TABLE public.forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_initial TEXT NOT NULL,
  author_gradient TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT FALSE
);

-- Lost pets
CREATE TABLE public.lost_pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('pas', 'macka', 'ostalo')),
  breed TEXT DEFAULT '',
  color TEXT DEFAULT '',
  sex TEXT NOT NULL CHECK (sex IN ('muško', 'žensko')),
  image_url TEXT DEFAULT '',
  gallery JSONB DEFAULT '[]'::jsonb,
  city TEXT NOT NULL,
  neighborhood TEXT DEFAULT '',
  location_lat DECIMAL,
  location_lng DECIMAL,
  date_lost TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'lost' CHECK (status IN ('lost', 'found')),
  description TEXT DEFAULT '',
  special_marks TEXT DEFAULT '',
  has_microchip BOOLEAN DEFAULT FALSE,
  has_collar BOOLEAN DEFAULT FALSE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT DEFAULT '',
  share_count INTEGER DEFAULT 0,
  updates JSONB DEFAULT '[]'::jsonb,
  sightings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable RLS on all new tables
-- ============================================================

ALTER TABLE public.walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groomers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groomer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_pets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Walks: public read, authenticated sitters can insert/update own
CREATE POLICY "Walks viewable by everyone" ON public.walks FOR SELECT USING (true);
CREATE POLICY "Sitters can insert walks" ON public.walks FOR INSERT WITH CHECK (auth.uid() = sitter_id);
CREATE POLICY "Sitters can update own walks" ON public.walks FOR UPDATE USING (auth.uid() = sitter_id);

-- Pet updates: public read, sitters can insert own
CREATE POLICY "Pet updates viewable by everyone" ON public.pet_updates FOR SELECT USING (true);
CREATE POLICY "Sitters can insert updates" ON public.pet_updates FOR INSERT WITH CHECK (auth.uid() = sitter_id);

-- Pet passports: public read, pet owners can manage
CREATE POLICY "Pet passports viewable by everyone" ON public.pet_passports FOR SELECT USING (true);
CREATE POLICY "Owners can insert pet passports" ON public.pet_passports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners can update pet passports" ON public.pet_passports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
);

-- Groomers: public read, authenticated insert
CREATE POLICY "Groomers viewable by everyone" ON public.groomers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert groomers" ON public.groomers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update groomers" ON public.groomers FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Groomer reviews: public read, authenticated insert
CREATE POLICY "Groomer reviews viewable by everyone" ON public.groomer_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert groomer reviews" ON public.groomer_reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Trainers: public read, authenticated insert
CREATE POLICY "Trainers viewable by everyone" ON public.trainers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert trainers" ON public.trainers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update trainers" ON public.trainers FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Training programs: public read, trainer can manage
CREATE POLICY "Training programs viewable by everyone" ON public.training_programs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert programs" ON public.training_programs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update programs" ON public.training_programs FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Trainer reviews: public read, authenticated insert
CREATE POLICY "Trainer reviews viewable by everyone" ON public.trainer_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert trainer reviews" ON public.trainer_reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Articles: public read, authenticated insert
CREATE POLICY "Articles viewable by everyone" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert articles" ON public.articles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update articles" ON public.articles FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Forum topics: public read, authenticated write
CREATE POLICY "Forum topics viewable by everyone" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert topics" ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update topics" ON public.forum_topics FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Forum posts: public read, authenticated write
CREATE POLICY "Forum posts viewable by everyone" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update posts" ON public.forum_posts FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Lost pets: public read, authenticated write
CREATE POLICY "Lost pets viewable by everyone" ON public.lost_pets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert lost pets" ON public.lost_pets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own lost pets" ON public.lost_pets FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_walks_sitter ON public.walks(sitter_id);
CREATE INDEX idx_walks_booking ON public.walks(booking_id);
CREATE INDEX idx_walks_status ON public.walks(status);
CREATE INDEX idx_pet_updates_booking ON public.pet_updates(booking_id);
CREATE INDEX idx_groomers_city ON public.groomers(city);
CREATE INDEX idx_groomers_rating ON public.groomers(rating DESC);
CREATE INDEX idx_groomer_reviews_groomer ON public.groomer_reviews(groomer_id);
CREATE INDEX idx_trainers_city ON public.trainers(city);
CREATE INDEX idx_trainers_rating ON public.trainers(rating DESC);
CREATE INDEX idx_trainer_reviews_trainer ON public.trainer_reviews(trainer_id);
CREATE INDEX idx_training_programs_trainer ON public.training_programs(trainer_id);
CREATE INDEX idx_articles_category ON public.articles(category);
CREATE INDEX idx_articles_date ON public.articles(date DESC);
CREATE INDEX idx_forum_topics_category ON public.forum_topics(category_slug);
CREATE INDEX idx_forum_topics_pinned ON public.forum_topics(is_pinned DESC, created_at DESC);
CREATE INDEX idx_forum_posts_topic ON public.forum_posts(topic_id);
CREATE INDEX idx_lost_pets_city ON public.lost_pets(city);
CREATE INDEX idx_lost_pets_status ON public.lost_pets(status);
CREATE INDEX idx_lost_pets_date ON public.lost_pets(date_lost DESC);
