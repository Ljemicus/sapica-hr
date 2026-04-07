# Pet Social Network

Instagram-style social network for PetPark where pet owners can share moments, participate in challenges, and find playdates for their pets.

## Features

### 1. Pet Moments Feed (`/zajednica`)
- Instagram-style feed with posts, likes, and comments
- Create posts with text and images
- Tag pets in posts
- Like and comment on posts
- Real-time updates via Supabase realtime

### 2. AI Auto-Tagging
- Automatic detection of pet types (dog, cat, rabbit, bird)
- Activity recognition (playing, sleeping, eating, walking, etc.)
- Location detection (home, park, beach, mountain, etc.)
- AI caption generation

### 3. Pet of the Week (`/zajednica/najbolji`)
- Weekly contest for the best pet
- Voting system
- Featured winner display
- History of past winners

### 4. Pet Challenges (`/zajednica/izazovi`)
- Viral challenges with themes
- Entry submission via posts
- Public voting system
- Prizes for winners

### 5. Pet Playdates
- Nearby pet matching
- Playdate request system
- Accept/reject functionality
- Location-based matching (simulated)

## Database Schema

### Tables

- `social_posts` - Main posts table
- `social_likes` - Post likes
- `social_comments` - Post comments
- `social_challenges` - Challenge definitions
- `challenge_entries` - Posts entered into challenges
- `challenge_votes` - Votes on challenge entries
- `playdate_requests` - Playdate match requests
- `pet_of_the_week` - Weekly winners

### API Routes

- `GET/POST /api/social/posts` - List/create posts
- `DELETE/PATCH /api/social/posts/[id]` - Delete/update post
- `GET/POST /api/social/likes` - Toggle likes
- `GET/POST /api/social/comments` - List/add comments
- `GET/POST /api/social/challenges` - List/create challenges
- `GET/POST /api/social/challenges/[id]/entries` - Challenge entries and voting
- `GET/POST /api/social/playdates` - List/create playdate requests
- `PATCH /api/social/playdates/[id]` - Update playdate status
- `GET/POST /api/social/pet-of-week` - List/create pet of the week
- `GET /api/pets` - List user's pets

## Components

- `CreatePost` - Post creation form with AI tagging
- `PostCard` - Individual post display with interactions
- `ChallengeList` - Challenge display and voting
- `PetOfTheWeek` - Weekly winner showcase
- `PlaydateMatching` - Playdate matching interface
- `SocialFeedContent` - Main feed with tabs

## Usage

### Creating a Post

```tsx
import { CreatePost } from '@/components/social';

<CreatePost 
  pets={userPets} 
  onPostCreated={handlePostCreated}
  challengeId={optionalChallengeId}
/>
```

### Displaying the Feed

```tsx
import { SocialFeedContent } from '@/components/social';

<SocialFeedContent />
```

### Adding Navigation

The social network is accessible at:
- `/zajednica` - Main feed
- `/zajednica/izazovi` - Challenges
- `/zajednica/najbolji` - Pet of the week

Navigation links are already added to the navbar and bottom navigation.

## Future Enhancements

- Image upload to Supabase Storage
- Real-time notifications
- Stories feature
- Direct messaging between users
- Pet profiles with stats
- Advanced AI image analysis
- Push notifications for playdate requests
