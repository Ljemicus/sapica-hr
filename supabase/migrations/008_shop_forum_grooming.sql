-- Add missing columns to pre-existing tables
ALTER TABLE public.groomers ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS is_hot BOOLEAN DEFAULT FALSE;
ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS author_gradient TEXT;

-- ════════════════════════════════════════════════════════
-- Shop Products
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL NOT NULL,
  original_price DECIMAL,
  description TEXT,
  emoji TEXT DEFAULT '🐾',
  brand TEXT,
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  variants JSONB DEFAULT '[]',
  specs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════
-- Groomers
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.groomers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  services JSONB DEFAULT '[]',
  prices JSONB DEFAULT '{}',
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  specialization TEXT DEFAULT 'oba',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.groomer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  groomer_id UUID REFERENCES public.groomers(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_initial TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════
-- Trainers
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.trainers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  specializations JSONB DEFAULT '[]',
  price_per_hour DECIMAL,
  certificates JSONB DEFAULT '[]',
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  bio TEXT,
  certified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.training_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  duration_weeks INTEGER,
  sessions INTEGER,
  price DECIMAL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.trainer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_initial TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════
-- Forum (real tables)
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  color TEXT,
  topic_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_initial TEXT,
  author_gradient TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  comment_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_initial TEXT,
  author_gradient TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0
);

-- ════════════════════════════════════════════════════════
-- Blog articles
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.articles (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  author TEXT,
  date TEXT,
  category TEXT,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════
-- RLS — public read for all new tables
-- ════════════════════════════════════════════════════════

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groomers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groomer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read product_reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Public read groomers" ON public.groomers FOR SELECT USING (true);
CREATE POLICY "Public read groomer_reviews" ON public.groomer_reviews FOR SELECT USING (true);
CREATE POLICY "Public read trainers" ON public.trainers FOR SELECT USING (true);
CREATE POLICY "Public read training_programs" ON public.training_programs FOR SELECT USING (true);
CREATE POLICY "Public read trainer_reviews" ON public.trainer_reviews FOR SELECT USING (true);
CREATE POLICY "Public read forum_categories" ON public.forum_categories FOR SELECT USING (true);
CREATE POLICY "Public read forum_topics" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Public read forum_comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Public read articles" ON public.articles FOR SELECT USING (true);

-- Auth users can insert forum topics/comments
CREATE POLICY "Auth insert forum_topics" ON public.forum_topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth insert forum_comments" ON public.forum_comments FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_groomers_city ON public.groomers(city);
CREATE INDEX IF NOT EXISTS idx_trainers_city ON public.trainers(city);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON public.forum_topics(category_slug);
CREATE INDEX IF NOT EXISTS idx_forum_comments_topic ON public.forum_comments(topic_id);
