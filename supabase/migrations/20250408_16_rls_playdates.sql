-- RLS Policies for playdate_requests
CREATE POLICY "Users can view own playdate requests" ON public.playdate_requests FOR SELECT USING (
  auth.uid() = requester_user_id OR auth.uid() = target_user_id
);
CREATE POLICY "Users can create playdate requests" ON public.playdate_requests FOR INSERT WITH CHECK (auth.uid() = requester_user_id);
CREATE POLICY "Participants can update playdate requests" ON public.playdate_requests FOR UPDATE USING (
  auth.uid() = requester_user_id OR auth.uid() = target_user_id
);
