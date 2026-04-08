-- Pet Social Network Schema
-- Social posts, likes, comments, challenges, and playdates

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

-- Social reactions (like, paw, laugh, wow, love)
CREATE TABLE public.social_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'paw', 'laugh', 'wow', 'love')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Social comments
CREATE TABLE public.social_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social challenges (viral challenges)
CREATE TABLE public.social_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  prize_description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge entries (posts entered into challenges)
CREATE TABLE public.challenge_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.social_challenges(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, post_id)
);

-- Challenge votes
CREATE TABLE public.challenge_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES public.challenge_entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id, user_id)
);

-- Playdate requests (nearby pet matching)
CREATE TABLE public.playdate_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  target_pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  requester_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  proposed_date DATE,
  proposed_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet of the Week winners
CREATE TABLE public.pet_of_the_week (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE SET NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  votes_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playdate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_of_the_week ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_posts
CREATE POLICY "Social posts are viewable by everyone" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "Users can create own posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.social_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.social_posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_reactions
CREATE POLICY "Social reactions are viewable by everyone" ON public.social_reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON public.social_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reactions" ON public.social_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON public.social_reactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_comments
CREATE POLICY "Social comments are viewable by everyone" ON public.social_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.social_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.social_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_challenges
CREATE POLICY "Social challenges are viewable by everyone" ON public.social_challenges FOR SELECT USING (true);
CREATE POLICY "Admins can manage challenges" ON public.social_challenges FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for challenge_entries
CREATE POLICY "Challenge entries are viewable by everyone" ON public.challenge_entries FOR SELECT USING (true);
CREATE POLICY "Users can enter challenges with own posts" ON public.challenge_entries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.social_posts WHERE id = post_id AND user_id = auth.uid())
);

-- RLS Policies for challenge_votes
CREATE POLICY "Challenge votes are viewable by everyone" ON public.challenge_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote once per entry" ON public.challenge_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own votes" ON public.challenge_votes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playdate_requests
CREATE POLICY "Users can view own playdate requests" ON public.playdate_requests FOR SELECT USING (
  auth.uid() = requester_user_id OR auth.uid() = target_user_id
);
CREATE POLICY "Users can create playdate requests" ON public.playdate_requests FOR INSERT WITH CHECK (auth.uid() = requester_user_id);
CREATE POLICY "Participants can update playdate requests" ON public.playdate_requests FOR UPDATE USING (
  auth.uid() = requester_user_id OR auth.uid() = target_user_id
);

-- RLS Policies for pet_of_the_week
CREATE POLICY "Pet of the week is viewable by everyone" ON public.pet_of_the_week FOR SELECT USING (true);
CREATE POLICY "Admins can manage pet of the week" ON public.pet_of_the_week FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes for performance
CREATE INDEX idx_social_posts_user ON public.social_posts(user_id);
CREATE INDEX idx_social_posts_pet ON public.social_posts(pet_id);
CREATE INDEX idx_social_posts_created ON public.social_posts(created_at DESC);
CREATE INDEX idx_social_posts_challenge ON public.social_posts(challenge_id);
CREATE INDEX idx_social_reactions_post ON public.social_reactions(post_id);
CREATE INDEX idx_social_reactions_user ON public.social_reactions(user_id);
CREATE INDEX idx_social_comments_post ON public.social_comments(post_id);
CREATE INDEX idx_social_challenges_active ON public.social_challenges(is_active, end_date);
CREATE INDEX idx_challenge_entries_challenge ON public.challenge_entries(challenge_id);
CREATE INDEX idx_challenge_votes_entry ON public.challenge_votes(entry_id);
CREATE INDEX idx_playdate_requester ON public.playdate_requests(requester_user_id);
CREATE INDEX idx_playdate_target ON public.playdate_requests(target_user_id);
CREATE INDEX idx_pet_of_week_dates ON public.pet_of_the_week(week_start, week_end);

-- Functions for updating counts
CREATE OR REPLACE FUNCTION update_post_reactions_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_posts 
    SET 
      reactions_count = reactions_count + 1,
      reactions = jsonb_set(
        reactions, 
        ARRAY[NEW.reaction_type], 
        (COALESCE((reactions->>NEW.reaction_type)::int, 0) + 1)::text::jsonb
      )
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_posts 
    SET 
      reactions_count = reactions_count - 1,
      reactions = jsonb_set(
        reactions, 
        ARRAY[OLD.reaction_type], 
        (GREATEST(COALESCE((reactions->>OLD.reaction_type)::int, 0) - 1, 0))::text::jsonb
      )
    WHERE id = OLD.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old reaction count
    UPDATE public.social_posts 
    SET reactions = jsonb_set(
      reactions, 
      ARRAY[OLD.reaction_type], 
      (GREATEST(COALESCE((reactions->>OLD.reaction_type)::int, 0) - 1, 0))::text::jsonb
    )
    WHERE id = OLD.post_id;
    -- Add new reaction count
    UPDATE public.social_posts 
    SET reactions = jsonb_set(
      reactions, 
      ARRAY[NEW.reaction_type], 
      (COALESCE((reactions->>NEW.reaction_type)::int, 0) + 1)::text::jsonb
    )
    WHERE id = NEW.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_social_reaction_change
  AFTER INSERT OR DELETE OR UPDATE ON public.social_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reactions_count();

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_social_comment_change
  AFTER INSERT OR DELETE ON public.social_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

CREATE OR REPLACE FUNCTION update_challenge_entry_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenge_entries SET votes_count = votes_count + 1 WHERE id = NEW.entry_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenge_entries SET votes_count = votes_count - 1 WHERE id = OLD.entry_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_challenge_vote_change
  AFTER INSERT OR DELETE ON public.challenge_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_entry_votes();

-- Enable realtime for social features
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.playdate_requests;
