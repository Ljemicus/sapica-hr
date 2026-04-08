-- Foreign Key Constraints Migration (Simplified) - Fixed for sitter_bookings_old

-- Add FK constraint: sitter_bookings_old.pet_id -> pets.id
ALTER TABLE sitter_bookings_old
DROP CONSTRAINT IF EXISTS fk_bookings_pet;

ALTER TABLE sitter_bookings_old
ADD CONSTRAINT fk_bookings_pet
  FOREIGN KEY (pet_id) 
  REFERENCES pets(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Add FK constraint: sitter_bookings_old.sitter_id -> users.id
ALTER TABLE sitter_bookings_old
DROP CONSTRAINT IF EXISTS fk_bookings_sitter;

ALTER TABLE sitter_bookings_old
ADD CONSTRAINT fk_bookings_sitter
  FOREIGN KEY (sitter_id) 
  REFERENCES users(id) 
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

-- Add indexes for FK columns
CREATE INDEX IF NOT EXISTS idx_sitter_bookings_old_pet_id ON sitter_bookings_old(pet_id);
CREATE INDEX IF NOT EXISTS idx_sitter_bookings_old_sitter_id ON sitter_bookings_old(sitter_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
