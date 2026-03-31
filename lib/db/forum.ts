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
      .select('id, category_slug, title, author_name, author_initial, author_gradient, created_at, views, reply_count, comment_count, likes, is_pinned, is_hot, is_solved, last_reply_at, last_reply_by, tags')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category_slug', category);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as ForumTopic[];
  } catch {
    return [];
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
      .select('id, category_slug, title, author_name, author_initial, author_gradient, created_at, views, reply_count, comment_count, likes, is_pinned, is_hot, is_solved, last_reply_at, last_reply_by, tags')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as ForumTopic;
  } catch {
    return null;
  }
}

export async function getPosts(topicId: string): Promise<(ForumPost | ForumComment)[]> {
  if (!isSupabaseConfigured()) {
    return mockGetComments(topicId);
  }
  try {
    const supabase = await createClient();
    // Try forum_comments first (migration 008), fallback to forum_posts (migration 002)
    const { data, error } = await supabase
      .from('forum_comments')
      .select('id, topic_id, author_name, author_initial, author_gradient, content, created_at, likes')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    if (error || !data) {
      // Fallback to forum_posts table if forum_comments doesn't exist
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select('id, topic_id, author_name, author_initial, content, created_at, likes, is_best_answer')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      if (postsError || !posts) return [];
      return posts as ForumPost[];
    }
    return data as ForumComment[];
  } catch {
    return [];
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
      .select('id, category_slug, title, author_name, author_initial, author_gradient, created_at, views, reply_count, comment_count, likes, is_pinned, is_hot, is_solved, last_reply_at, last_reply_by, tags')
      .order('likes', { ascending: false })
      .limit(5);
    if (error || !data) return [];
    return data as ForumTopic[];
  } catch {
    return [];
  }
}
