-- Function to update challenge entry votes count
CREATE OR REPLACE FUNCTION update_entry_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenge_entries 
    SET votes_count = votes_count + 1
    WHERE id = NEW.entry_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenge_entries 
    SET votes_count = GREATEST(votes_count - 1, 0)
    WHERE id = OLD.entry_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for challenge votes count
DROP TRIGGER IF EXISTS update_votes_count ON public.challenge_votes;
CREATE TRIGGER update_votes_count
AFTER INSERT OR DELETE ON public.challenge_votes
FOR EACH ROW EXECUTE FUNCTION update_entry_votes_count();
