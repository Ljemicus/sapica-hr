-- Social posts (Pet Moments feed)
CREATE TABLE public.social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]'::jsonb,
  ai_tags JSONB DEFAULT '[]'::jsonb,
  ai_caption TEXT,
  reactions_count INTEGER DEFAULT 0,
  reactions JSONB DEFAULT '{"like": 0, "paw": 0, "laugh": 0, "wow": 0, "love": 0}'::jsonb,
  comments_count INTEGER DEFAULT 0,
  is_challenge_entry BOOLEAN DEFAULT FALSE,
  challenge_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
