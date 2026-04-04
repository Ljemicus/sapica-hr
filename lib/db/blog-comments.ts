import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { BlogComment } from '@/lib/types';

type BlogCommentUserRow = {
  id: string;
  name: string;
  avatar_url: string | null;
};

type BlogCommentRow = {
  id: string;
  article_slug: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: BlogCommentUserRow | BlogCommentUserRow[] | null;
};

function normalizeUser(user: BlogCommentRow['user']): BlogCommentUserRow | undefined {
  if (!user) {
    return undefined;
  }

  return Array.isArray(user) ? user[0] : user;
}

function toBlogComment(row: BlogCommentRow): BlogComment {
  return {
    id: row.id,
    article_slug: row.article_slug,
    user_id: row.user_id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user: normalizeUser(row.user),
  };
}

export async function getArticleComments(articleSlug: string): Promise<BlogComment[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_comments')
      .select('id, article_slug, user_id, content, created_at, updated_at, user:users!user_id(id, name, avatar_url)')
      .eq('article_slug', articleSlug)
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return (data as unknown as BlogCommentRow[]).map(toBlogComment);
  } catch {
    return [];
  }
}

export async function getArticleCommentById(commentId: string): Promise<BlogComment | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_comments')
      .select('id, article_slug, user_id, content, created_at, updated_at, user:users!user_id(id, name, avatar_url)')
      .eq('id', commentId)
      .single();

    if (error || !data) {
      return null;
    }

    return toBlogComment(data as unknown as BlogCommentRow);
  } catch {
    return null;
  }
}

export async function createArticleComment(input: {
  article_slug: string;
  user_id: string;
  content: string;
}): Promise<BlogComment | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        article_slug: input.article_slug,
        user_id: input.user_id,
        content: input.content,
      })
      .select('id, article_slug, user_id, content, created_at, updated_at, user:users!user_id(id, name, avatar_url)')
      .single();

    if (error || !data) {
      return null;
    }

    return toBlogComment(data as unknown as BlogCommentRow);
  } catch {
    return null;
  }
}

export async function reportArticleComment(input: {
  comment_id: string;
  reporter_user_id: string;
  article_slug: string;
  reason?: string | null;
}): Promise<'created' | 'duplicate' | 'error'> {
  if (!isSupabaseConfigured()) {
    return 'error';
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('blog_comment_reports')
      .insert({
        comment_id: input.comment_id,
        reporter_user_id: input.reporter_user_id,
        article_slug: input.article_slug,
        reason: input.reason ?? null,
      });

    if (!error) {
      return 'created';
    }

    if (error.code === '23505') {
      return 'duplicate';
    }

    return 'error';
  } catch {
    return 'error';
  }
}

export async function deleteArticleComment(commentId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', commentId);

    return !error;
  } catch {
    return false;
  }
}
