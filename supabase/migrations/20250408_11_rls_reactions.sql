-- RLS Policies for social_reactions
CREATE POLICY "Social reactions are viewable by everyone" ON public.social_reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON public.social_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reactions" ON public.social_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON public.social_reactions FOR DELETE USING (auth.uid() = user_id);
