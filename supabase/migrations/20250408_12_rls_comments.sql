-- RLS Policies for social_comments
CREATE POLICY "Social comments are viewable by everyone" ON public.social_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.social_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.social_comments FOR DELETE USING (auth.uid() = user_id);
