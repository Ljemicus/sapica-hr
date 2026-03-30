-- Add 'psi' and 'macke' categories to articles table
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_category_check CHECK (category IN ('zdravlje', 'prehrana', 'dresura', 'putovanje', 'zabava', 'psi', 'macke'));
