-- RLS Policies for social_posts
CREATE POLICY "Social posts are viewable by everyone" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "Users can create own posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.social_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.social_posts FOR DELETE USING (auth.uid() = user_id);
