// ── Social Network Types ──

export type ReactionType = 'like' | 'paw' | 'laugh' | 'wow' | 'love';

export interface SocialPost {
  id: string;
  user_id: string;
  pet_id: string | null;
  content: string;
  media_urls: string[];
  ai_tags: string[];
  ai_caption: string | null;
  reactions_count: number;
  reactions: Record<ReactionType, number>;
  comments_count: number;
  is_challenge_entry: boolean;
  challenge_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialPostWithDetails extends SocialPost {
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    photo_url: string | null;
  } | null;
}

export interface SocialReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface SocialComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface SocialCommentWithUser extends SocialComment {
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export interface SocialChallenge {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  prize_description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeEntry {
  id: string;
  challenge_id: string;
  post_id: string;
  votes_count: number;
  created_at: string;
}

export interface ChallengeEntryWithDetails extends ChallengeEntry {
  post: SocialPostWithDetails;
}

export interface ChallengeVote {
  id: string;
  entry_id: string;
  user_id: string;
  created_at: string;
}

export interface PlaydateRequest {
  id: string;
  requester_pet_id: string;
  target_pet_id: string;
  requester_user_id: string;
  target_user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string | null;
  proposed_date: string | null;
  proposed_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaydateRequestWithDetails extends PlaydateRequest {
  requester_pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    photo_url: string | null;
  };
  target_pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    photo_url: string | null;
  };
  requester_user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  target_user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export interface PetOfTheWeek {
  id: string;
  pet_id: string;
  post_id: string | null;
  week_start: string;
  week_end: string;
  votes_count: number;
  featured: boolean;
  created_at: string;
}

export interface PetOfTheWeekWithDetails extends PetOfTheWeek {
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    photo_url: string | null;
  };
  post: {
    id: string;
    content: string;
    media_urls: string[];
  } | null;
}

// AI Tag types
export type AIPetTag = 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';
export type AIActivityTag = 'playing' | 'sleeping' | 'eating' | 'walking' | 'swimming' | 'training' | 'cuddling' | 'exploring';
export type AILocationTag = 'home' | 'park' | 'beach' | 'mountain' | 'city' | 'forest' | 'indoor' | 'outdoor';

export interface AITags {
  petTypes: AIPetTag[];
  activities: AIActivityTag[];
  locations: AILocationTag[];
}
