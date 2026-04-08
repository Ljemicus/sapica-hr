-- RLS Policies for challenge_entries
CREATE POLICY "Challenge entries are viewable by everyone" ON public.challenge_entries FOR SELECT USING (true);
CREATE POLICY "Users can enter challenges with own posts" ON public.challenge_entries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.social_posts WHERE id = post_id AND user_id = auth.uid())
);
