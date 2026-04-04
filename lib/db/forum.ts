/**
 * Forum data layer — real Supabase queries.
 * Schema: forum_topics and forum_comments have denormalized author fields
 * (author_name, author_initial, author_gradient) plus new user_id/body/status.
 */
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { appLogger } from '@/lib/logger';
import type {
  ForumCategory,
  ForumCategorySlug,
  ForumTopic,
  ForumPost,
  ForumComment,
} from '@/lib/types';
import { FORUM_CATEGORIES as CATEGORIES } from '@/lib/types';

// ── Gradient helpers (for newly created topics from current user) ──────────────

const gradients = [
  'from-orange-400 to-amber-300',
  'from-blue-400 to-cyan-300',
  'from-green-400 to-emerald-300',
  'from-purple-400 to-pink-300',
  'from-rose-400 to-orange-300',
  'from-teal-400 to-cyan-300',
];

function nameToGradient(name: string): string {
  return gradients[(name ?? '?').charCodeAt(0) % gradients.length];
}

function nameToInitial(name: string): string {
  return (name ?? '?').charAt(0).toUpperCase();
}

// ── Row types ─────────────────────────────────────────────────────────────────

type TopicRow = {
  id: string;
  user_id?: string | null;
  category_slug: string;
  title: string;
  body?: string;
  author_name: string;
  author_initial: string;
  author_gradient: string;
  is_pinned: boolean;
  is_hot: boolean;
  is_solved: boolean;
  status?: string;
  likes: number;
  comment_count: number;
  view_count?: number;
  views?: number;
  created_at: string;
  cover_image_url?: string | null;
};

type CommentRow = {
  id: string;
  topic_id: string;
  user_id?: string | null;
  author_name: string;
  author_initial: string;
  author_gradient: string;
  content: string;
  likes: number;
  status?: string;
  created_at: string;
};

function topicRowToForumTopic(row: TopicRow): ForumTopic {
  return {
    id: row.id,
    user_id: row.user_id ?? undefined,
    category_slug: row.category_slug as ForumCategorySlug,
    title: row.title,
    body: row.body,
    status: row.status as 'active' | 'hidden' | 'locked' | undefined,
    author_name: row.author_name ?? 'Korisnik',
    author_initial: row.author_initial ?? nameToInitial(row.author_name ?? '?'),
    author_gradient: row.author_gradient ?? nameToGradient(row.author_name ?? '?'),
    created_at: row.created_at,
    views: row.view_count ?? row.views ?? 0,
    comment_count: row.comment_count,
    likes: row.likes,
    is_pinned: row.is_pinned,
    is_hot: row.is_hot,
    is_solved: row.is_solved,
    cover_image_url: row.cover_image_url ?? undefined,
  } as ForumTopic;
}

function commentRowToForumComment(row: CommentRow): ForumComment {
  return {
    id: row.id,
    topic_id: row.topic_id,
    user_id: row.user_id ?? undefined,
    status: row.status as 'active' | 'hidden' | undefined,
    author_name: row.author_name ?? 'Korisnik',
    author_initial: row.author_initial ?? nameToInitial(row.author_name ?? '?'),
    author_gradient: row.author_gradient ?? nameToGradient(row.author_name ?? '?'),
    content: row.content,
    created_at: row.created_at,
    likes: row.likes,
  } as ForumComment;
}

const TOPIC_SELECT =
  'id, user_id, category_slug, title, body, author_name, author_initial, author_gradient, is_pinned, is_hot, is_solved, status, likes, comment_count, view_count, created_at, cover_image_url';

const COMMENT_SELECT =
  'id, topic_id, user_id, author_name, author_initial, author_gradient, content, likes, status, created_at';

// ── Public API ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<ForumCategory[]> {
  return CATEGORIES;
}

export async function getTopics(category?: ForumCategorySlug): Promise<ForumTopic[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    // RLS enforces visibility: non-admins see only active topics, admins see all.
    let query = supabase
      .from('forum_topics')
      .select(TOPIC_SELECT)
      .in('status', ['active', 'hidden', 'locked'])
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (category) {
      query = query.eq('category_slug', category);
    }

    const { data, error } = await query;
    if (error || !data) {
      appLogger.warn('forum', 'getTopics failed', { message: error?.message });
      return [];
    }

    return (data as unknown as TopicRow[]).map(topicRowToForumTopic);
  } catch (err) {
    appLogger.warn('forum', 'getTopics threw', { message: String(err) });
    return [];
  }
}

export async function getTopic(id: string): Promise<ForumTopic | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_topics')
      .select(TOPIC_SELECT)
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return topicRowToForumTopic(data as unknown as TopicRow);
  } catch {
    return null;
  }
}

export async function getPosts(topicId: string): Promise<(ForumPost | ForumComment)[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_comments')
      .select(COMMENT_SELECT)
      .eq('topic_id', topicId)
      .in('status', ['active', 'hidden'])
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return (data as unknown as CommentRow[]).map(commentRowToForumComment);
  } catch {
    return [];
  }
}

export async function getTrendingTopics(): Promise<ForumTopic[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_topics')
      .select(TOPIC_SELECT)
      .in('status', ['active', 'hidden', 'locked'])
      .order('likes', { ascending: false })
      .order('comment_count', { ascending: false })
      .limit(5);

    if (error || !data) return [];

    return (data as unknown as TopicRow[]).map(topicRowToForumTopic);
  } catch {
    return [];
  }
}

export async function createTopic(params: {
  user_id: string;
  category_slug: ForumCategorySlug;
  title: string;
  body: string;
  author_name: string;
  author_initial: string;
  author_gradient: string;
  cover_image_url?: string;
}): Promise<ForumTopic | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        user_id: params.user_id,
        category_slug: params.category_slug,
        title: params.title.trim(),
        body: params.body.trim(),
        author_name: params.author_name,
        author_initial: params.author_initial,
        author_gradient: params.author_gradient,
        ...(params.cover_image_url ? { cover_image_url: params.cover_image_url } : {}),
      })
      .select(TOPIC_SELECT)
      .single();

    if (error || !data) {
      appLogger.warn('forum', 'createTopic failed', { message: error?.message });
      return null;
    }

    return topicRowToForumTopic(data as unknown as TopicRow);
  } catch {
    return null;
  }
}

export async function createComment(params: {
  topic_id: string;
  user_id: string;
  content: string;
  author_name: string;
  author_initial: string;
  author_gradient: string;
}): Promise<ForumComment | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        topic_id: params.topic_id,
        user_id: params.user_id,
        content: params.content.trim(),
        author_name: params.author_name,
        author_initial: params.author_initial,
        author_gradient: params.author_gradient,
      })
      .select(COMMENT_SELECT)
      .single();

    if (error || !data) {
      appLogger.warn('forum', 'createComment failed', { message: error?.message });
      return null;
    }

    // comment_count is updated by DB trigger (trg_comment_count)
    return commentRowToForumComment(data as unknown as CommentRow);
  } catch {
    return null;
  }
}

export async function incrementTopicView(topicId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = await createClient();
    await supabase.rpc('increment_topic_view', { topic_id_arg: topicId });
  } catch {
    // non-critical
  }
}
