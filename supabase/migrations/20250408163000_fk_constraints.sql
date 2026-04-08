-- =============================================================================
-- Foreign Key Constraints Migration
-- Date: 2025-04-08
-- Description: Adds foreign key constraints to ensure referential integrity
-- =============================================================================

-- =============================================================================
-- Step 1: Check for orphaned records before adding constraints
-- =============================================================================

-- Check for orphaned bookings.pet_id references
DO $$
DECLARE
  orphaned_pets INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_pets
  FROM sitter_bookings_old b
  LEFT JOIN pets p ON b.pet_id = p.id
  WHERE b.pet_id IS NOT NULL AND p.id IS NULL;
  
  IF orphaned_pets > 0 THEN
    RAISE NOTICE 'Warning: Found % bookings with orphaned pet_id references', orphaned_pets;
    RAISE NOTICE 'These records will need to be cleaned up before adding FK constraint';
  ELSE
    RAISE NOTICE 'No orphaned pet_id references found in bookings table';
  END IF;
END $$;

-- Check for orphaned bookings.sitter_id references
DO $$
DECLARE
  orphaned_sitters INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_sitters
  FROM sitter_bookings_old b
  LEFT JOIN sitter_profiles p ON b.sitter_id = p.user_id
  WHERE b.sitter_id IS NOT NULL AND p.user_id IS NULL;
  
  IF orphaned_sitters > 0 THEN
    RAISE NOTICE 'Warning: Found % bookings with orphaned sitter_id references', orphaned_sitters;
    RAISE NOTICE 'These records will need to be cleaned up before adding FK constraint';
  ELSE
    RAISE NOTICE 'No orphaned sitter_id references found in bookings table';
  END IF;
END $$;

-- Check for orphaned social_posts.user_id references
DO $$
DECLARE
  orphaned_posts INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_posts
  FROM social_posts sp
  LEFT JOIN auth.users u ON sp.user_id = u.id
  WHERE sp.user_id IS NOT NULL AND u.id IS NULL;
  
  IF orphaned_posts > 0 THEN
    RAISE NOTICE 'Warning: Found % social_posts with orphaned user_id references', orphaned_posts;
    RAISE NOTICE 'These records will need to be cleaned up before adding FK constraint';
  ELSE
    RAISE NOTICE 'No orphaned user_id references found in social_posts table';
  END IF;
END $$;

-- Check for orphaned social_comments.user_id references
DO $$
DECLARE
  orphaned_comment_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_comment_users
  FROM social_comments sc
  LEFT JOIN auth.users u ON sc.user_id = u.id
  WHERE sc.user_id IS NOT NULL AND u.id IS NULL;
  
  IF orphaned_comment_users > 0 THEN
    RAISE NOTICE 'Warning: Found % social_comments with orphaned user_id references', orphaned_comment_users;
    RAISE NOTICE 'These records will need to be cleaned up before adding FK constraint';
  ELSE
    RAISE NOTICE 'No orphaned user_id references found in social_comments table';
  END IF;
END $$;

-- Check for orphaned social_comments.post_id references
DO $$
DECLARE
  orphaned_comments INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_comments
  FROM social_comments sc
  LEFT JOIN social_posts sp ON sc.post_id = sp.id
  WHERE sc.post_id IS NOT NULL AND sp.id IS NULL;
  
  IF orphaned_comments > 0 THEN
    RAISE NOTICE 'Warning: Found % social_comments with orphaned post_id references', orphaned_comments;
    RAISE NOTICE 'These records will need to be cleaned up before adding FK constraint';
  ELSE
    RAISE NOTICE 'No orphaned post_id references found in social_comments table';
  END IF;
END $$;

-- =============================================================================
-- Step 2: Clean up orphaned records (if any exist)
-- Uncomment and modify these if you need to clean up orphaned records
-- =============================================================================

-- Example: Delete orphaned bookings (uncomment if needed)
-- DELETE FROM bookings
-- WHERE pet_id IS NOT NULL 
--   AND pet_id NOT IN (SELECT id FROM pets);

-- Example: Set orphaned sitter_id to NULL (uncomment if needed)
-- UPDATE bookings
-- SET sitter_id = NULL
-- WHERE sitter_id IS NOT NULL 
--   AND sitter_id NOT IN (SELECT id FROM sitter_profiles);

-- Example: Delete orphaned social posts (uncomment if needed)
-- DELETE FROM social_posts
-- WHERE user_id IS NOT NULL 
--   AND user_id NOT IN (SELECT id FROM auth.users);

-- Example: Delete orphaned comments (uncomment if needed)
-- DELETE FROM social_comments
-- WHERE user_id IS NOT NULL 
--   AND user_id NOT IN (SELECT id FROM auth.users);

-- DELETE FROM social_comments
-- WHERE post_id IS NOT NULL 
--   AND post_id NOT IN (SELECT id FROM social_posts);

-- =============================================================================
-- Step 3: Add Foreign Key Constraints
-- =============================================================================

-- Add FK constraint: bookings.pet_id -> pets.id
ALTER TABLE sitter_bookings_old
DROP CONSTRAINT IF EXISTS fk_bookings_pet;

ALTER TABLE sitter_bookings_old
ADD CONSTRAINT fk_bookings_pet
  FOREIGN KEY (pet_id) 
  REFERENCES pets(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Add FK constraint: bookings.sitter_id -> profiles.id
ALTER TABLE sitter_bookings_old
DROP CONSTRAINT IF EXISTS fk_bookings_sitter;

ALTER TABLE sitter_bookings_old
ADD CONSTRAINT fk_bookings_sitter
  FOREIGN KEY (sitter_id) 
  REFERENCES sitter_profiles(user_id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Add FK constraint: social_posts.user_id -> auth.users.id
ALTER TABLE social_posts
DROP CONSTRAINT IF EXISTS fk_social_posts_user;

ALTER TABLE social_posts
ADD CONSTRAINT fk_social_posts_user
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- Add FK constraint: social_comments.user_id -> auth.users.id
ALTER TABLE social_comments
DROP CONSTRAINT IF EXISTS fk_social_comments_user;

ALTER TABLE social_comments
ADD CONSTRAINT fk_social_comments_user
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- Add FK constraint: social_comments.post_id -> social_posts.id
ALTER TABLE social_comments
DROP CONSTRAINT IF EXISTS fk_social_comments_post;

ALTER TABLE social_comments
ADD CONSTRAINT fk_social_comments_post
  FOREIGN KEY (post_id) 
  REFERENCES social_posts(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- =============================================================================
-- Step 4: Add indexes for FK columns (if not already present)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_bookings_pet_id ON sitter_bookings_old(pet_id);
CREATE INDEX IF NOT EXISTS idx_bookings_sitter_id ON sitter_bookings_old(sitter_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);

-- =============================================================================
-- Step 5: Verify constraints were added
-- =============================================================================

DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  RAISE NOTICE 'Foreign Key Constraints Added:';
  
  FOR constraint_record IN 
    SELECT 
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN (
        'bookings',
        'social_posts',
        'social_comments'
      )
    ORDER BY tc.table_name, tc.constraint_name
  LOOP
    RAISE NOTICE '% on %(%): references %(%))',
      constraint_record.constraint_name,
      constraint_record.table_name,
      constraint_record.column_name,
      constraint_record.foreign_table_name,
      constraint_record.foreign_column_name;
  END LOOP;
END $$;
