import { createClient } from '@/lib/supabase/server';
import type {
  ForumCategory,
  ForumCategorySlug,
  ForumTopic,
  ForumPost,
} from '@/lib/types';
import { FORUM_CATEGORIES as CATEGORIES } from '@/lib/types';

export async function getCategories(): Promise<ForumCategory[]> {
  return CATEGORIES;
}

export async function getTopics(category?: ForumCategorySlug): Promise<ForumTopic[]> {
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
    if (error || !data) return [];
    return data as ForumTopic[];
  } catch {
    return [];
  }
}

export async function getTopic(id: string): Promise<ForumTopic | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as ForumTopic;
  } catch {
    return null;
  }
}

export async function getPosts(topicId: string): Promise<ForumPost[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data as ForumPost[];
  } catch {
    return [];
  }
}

export async function getTrendingTopics(): Promise<ForumTopic[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*')
      .order('likes', { ascending: false })
      .limit(5);
    if (error || !data) return [];
    return data as ForumTopic[];
  } catch {
    return [];
  }
}
