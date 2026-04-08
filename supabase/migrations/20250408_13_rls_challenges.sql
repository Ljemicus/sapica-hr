-- RLS Policies for social_challenges
CREATE POLICY "Social challenges are viewable by everyone" ON public.social_challenges FOR SELECT USING (true);
CREATE POLICY "Admins can manage challenges" ON public.social_challenges FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
