-- Clean up orphaned records before adding FK constraints

-- Delete orphaned bookings from sitter_bookings_old (sitter_id not in users)
DELETE FROM sitter_bookings_old
WHERE sitter_id IS NOT NULL 
  AND sitter_id NOT IN (SELECT id FROM users);

-- Delete orphaned social posts
DELETE FROM social_posts
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM auth.users);

-- Delete orphaned comments
DELETE FROM social_comments
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM social_comments
WHERE post_id IS NOT NULL 
  AND post_id NOT IN (SELECT id FROM social_posts);
