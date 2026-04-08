-- Challenge entries (posts entered into challenges)
CREATE TABLE public.challenge_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.social_challenges(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, post_id)
);
