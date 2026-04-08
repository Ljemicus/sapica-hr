-- Indexes for social tables performance
CREATE INDEX IF NOT EXISTS idx_social_posts_user ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_pet ON public.social_posts(pet_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_challenge ON public.social_posts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_social_reactions_post ON public.social_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_social_reactions_user ON public.social_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON public.social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_challenges_active ON public.social_challenges(is_active, end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_challenge ON public.challenge_entries(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_votes_entry ON public.challenge_votes(entry_id);
CREATE INDEX IF NOT EXISTS idx_playdate_requester ON public.playdate_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_playdate_target ON public.playdate_requests(target_user_id);
CREATE INDEX IF NOT EXISTS idx_pet_of_week_dates ON public.pet_of_the_week(week_start, week_end);
