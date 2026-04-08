-- RLS Policies for challenge_votes
CREATE POLICY "Challenge votes are viewable by everyone" ON public.challenge_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote once per entry" ON public.challenge_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own votes" ON public.challenge_votes FOR DELETE USING (auth.uid() = user_id);
