-- Function to update post reactions count
CREATE OR REPLACE FUNCTION update_post_reactions_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_posts 
    SET 
      reactions_count = reactions_count + 1,
      reactions = jsonb_set(
        reactions, 
        ARRAY[NEW.reaction_type], 
        (COALESCE((reactions->>NEW.reaction_type)::int, 0) + 1)::text::jsonb
      )
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_posts 
    SET 
      reactions_count = reactions_count - 1,
      reactions = jsonb_set(
        reactions, 
        ARRAY[OLD.reaction_type], 
        (GREATEST(COALESCE((reactions->>OLD.reaction_type)::int, 0) - 1, 0))::text::jsonb
      )
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reactions count
DROP TRIGGER IF EXISTS update_reactions_count ON public.social_reactions;
CREATE TRIGGER update_reactions_count
AFTER INSERT OR DELETE ON public.social_reactions
FOR EACH ROW EXECUTE FUNCTION update_post_reactions_count();
