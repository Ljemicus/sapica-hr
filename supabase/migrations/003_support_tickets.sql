-- Support tickets table for contact form
CREATE TABLE public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('bug', 'prijedlog', 'pitanje', 'ostalo')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (even unauthenticated users can contact support)
CREATE POLICY "Anyone can create support tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (true);

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_email ON public.support_tickets(email);
