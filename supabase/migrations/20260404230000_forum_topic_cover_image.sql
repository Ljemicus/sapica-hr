-- Add optional cover image URL to forum topics
ALTER TABLE public.forum_topics
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.forum_topics.cover_image_url
  IS 'Optional cover image URL uploaded by the topic author. Falls back to category gradient when NULL.';
