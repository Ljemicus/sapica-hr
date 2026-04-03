/**
 * Forum data layer.
 * Seeded forum content disabled — returns empty results.
 * Will be re-enabled when real community content is available.
 */
import type {
  ForumCategory,
  ForumCategorySlug,
  ForumTopic,
  ForumPost,
  ForumComment,
} from '@/lib/types';
import { FORUM_CATEGORIES as CATEGORIES } from '@/lib/types';

export async function getCategories(): Promise<ForumCategory[]> {
  return CATEGORIES;
}

export async function getTopics(_category?: ForumCategorySlug): Promise<ForumTopic[]> {
  return [];
}

export async function getTopic(_id: string): Promise<ForumTopic | null> {
  return null;
}

export async function getPosts(_topicId: string): Promise<(ForumPost | ForumComment)[]> {
  return [];
}

export async function getTrendingTopics(): Promise<ForumTopic[]> {
  return [];
}
