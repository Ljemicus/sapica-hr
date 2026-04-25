# Legacy write freeze

Zabranjeno u novim patchevima od 2026-04-24:

- `.from('users')` (koristi `auth.users` s canonical profile join iz Cycle 7)
- `.from('sitter_profiles')`, `.from('groomer_profiles')`
- `.from('social_posts')`, `.from('social_comments')`, `.from('blog_articles')`
- `.from('adoption_listings')`, `.from('rescue_organizations')`, `.from('rescue_appeals')`
- `.from('forum_topics')`, `.from('lost_pets')`, `.from('veterinarians')`, `.from('dog_friendly_places')`
- `booking.owner_id`, `booking.sitter_id`, `booking.total_price`
- bilo koji novi feature koji pojačava ghost model

Enforced od Cycle 24 u CI grep-block-u. Prije toga — honor code.
