-- Pet Photo Contests system
CREATE TABLE public.photo_contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,
  cover_image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  voting_end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'voting', 'closed')),
  max_entries_per_user INTEGER DEFAULT 1,
  prize_description TEXT,
  prize_image_url TEXT,
  rules TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contest entries
CREATE TABLE public.contest_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID REFERENCES public.photo_contests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  votes_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  is_disqualified BOOLEAN DEFAULT FALSE,
  disqualification_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

-- Votes
CREATE TABLE public.contest_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES public.contest_entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id, user_id)
);

-- Community Challenges
CREATE TABLE public.community_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('walks', 'bookings', 'photos', 'reviews', 'referrals')),
  target_count INTEGER NOT NULL,
  reward_badge_id UUID,
  reward_points INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE public.user_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.community_challenges(id) ON DELETE CASCADE NOT NULL,
  current_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Badges
CREATE TABLE public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  icon_emoji TEXT,
  color TEXT,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('bookings_count', 'reviews_count', 'walks_count', 'photos_count', 'referrals_count', 'challenge_completion')),
  requirement_count INTEGER NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges
CREATE TABLE public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Pet Diary
CREATE TABLE public.pet_journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('milestone', 'health', 'behavior', 'photo', 'note')),
  title TEXT,
  content TEXT,
  image_url TEXT,
  event_date DATE,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet milestones
CREATE TABLE public.pet_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('birthday', 'adoption_day', 'first_walk', 'first_vaccination', 'training_complete', 'weight_goal', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  milestone_date DATE NOT NULL,
  is_celebrated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_photo_contests_status ON public.photo_contests(status);
CREATE INDEX idx_contest_entries_contest ON public.contest_entries(contest_id);
CREATE INDEX idx_contest_votes_entry ON public.contest_votes(entry_id);
CREATE INDEX idx_user_challenges_user ON public.user_challenges(user_id);
CREATE INDEX idx_pet_journal_pet ON public.pet_journal_entries(pet_id);
CREATE INDEX idx_pet_milestones_pet ON public.pet_milestones(pet_id);

-- RLS
ALTER TABLE public.photo_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active contests" ON public.photo_contests FOR SELECT USING (status IN ('active', 'voting', 'closed'));
CREATE POLICY "Users can manage their own entries" ON public.contest_entries FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can vote" ON public.contest_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can view their challenges" ON public.user_challenges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their pet journal" ON public.pet_journal_entries FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their milestones" ON public.pet_milestones FOR ALL USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = pet_milestones.pet_id AND pets.owner_id = auth.uid()));
