import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import {
  getForumTopics as mockGetTopics,
  getForumTopicById as mockGetTopic,
  getForumCommentsForTopic as mockGetComments,
  getTrendingTopics as mockGetTrending,
} from '@/lib/mock-data';
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

export async function getTopics(category?: ForumCategorySlug): Promise<ForumTopic[]> {
  if (!isSupabaseConfigured()) {
    return mockGetTopics(category);
  }
  try {
    const supabase = await createClient();
    let query = supabase
      .from('forum_topics')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category_slug', category);
    }

    const { data, error } = await query;
    if (error || !data) return mockGetTopics(category);
    return data as ForumTopic[];
  } catch {
    return mockGetTopics(category);
  }
}

export async function getTopic(id: string): Promise<ForumTopic | null> {
  if (!isSupabaseConfigured()) {
    return mockGetTopic(id) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return mockGetTopic(id) ?? null;
    return data as ForumTopic;
  } catch {
    return mockGetTopic(id) ?? null;
  }
}

export async function getPosts(topicId: string): Promise<(ForumPost | ForumComment)[]> {
  if (!isSupabaseConfigured()) {
    return mockGetComments(topicId);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    if (error || !data) return mockGetComments(topicId);
    return data as ForumPost[];
  } catch {
    return mockGetComments(topicId);
  }
}

export async function getTrendingTopics(): Promise<ForumTopic[]> {
  if (!isSupabaseConfigured()) {
    return mockGetTrending();
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*')
      .order('likes', { ascending: false })
      .limit(5);
    if (error || !data) return mockGetTrending();
    return data as ForumTopic[];
  } catch {
    return mockGetTrending();
  }
}
