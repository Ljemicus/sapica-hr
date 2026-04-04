import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getArticle, getArticleComments, createArticleComment } from '@/lib/db';
import { blogCommentSchema } from '@/lib/validations';
import type { BlogComment } from '@/lib/types';

type BlogCommentsResponse = BlogComment[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const articleSlug = searchParams.get('article_slug');

  if (!articleSlug) {
    return apiError({ status: 400, code: 'MISSING_ARTICLE_SLUG', message: 'Nedostaje slug članka.' });
  }

  const article = await getArticle(articleSlug);
  if (!article) {
    return apiError({ status: 404, code: 'ARTICLE_NOT_FOUND', message: 'Članak nije pronađen.' });
  }

  const comments = await getArticleComments(articleSlug);
  return NextResponse.json<BlogCommentsResponse>(comments);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Morate biti prijavljeni za komentiranje.' });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Neispravan JSON payload.' });
  }

  const parsed = blogCommentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({
      status: 400,
      code: 'INVALID_INPUT',
      message: 'Neispravan komentar.',
      details: parsed.error.flatten(),
    });
  }

  const article = await getArticle(parsed.data.article_slug);
  if (!article) {
    return apiError({ status: 404, code: 'ARTICLE_NOT_FOUND', message: 'Članak nije pronađen.' });
  }

  const comment = await createArticleComment({
    article_slug: parsed.data.article_slug,
    user_id: user.id,
    content: parsed.data.content,
  });

  if (!comment) {
    return apiError({ status: 500, code: 'COMMENT_CREATE_FAILED', message: 'Komentar nije spremljen. Pokušajte ponovno.' });
  }

  return NextResponse.json(comment, { status: 201 });
}
