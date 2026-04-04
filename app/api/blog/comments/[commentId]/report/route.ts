import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getArticleCommentById, reportArticleComment } from '@/lib/db';

interface RouteContext {
  params: Promise<{ commentId: string }>;
}

export async function POST(_: Request, { params }: RouteContext) {
  const user = await getAuthUser();
  if (!user) {
    return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Morate biti prijavljeni kako biste prijavili komentar.' });
  }

  const { commentId } = await params;
  const comment = await getArticleCommentById(commentId);

  if (!comment) {
    return apiError({ status: 404, code: 'COMMENT_NOT_FOUND', message: 'Komentar nije pronađen.' });
  }

  if (comment.user_id === user.id) {
    return apiError({ status: 400, code: 'CANNOT_REPORT_OWN_COMMENT', message: 'Ne možete prijaviti vlastiti komentar.' });
  }

  const result = await reportArticleComment({
    comment_id: comment.id,
    reporter_user_id: user.id,
    article_slug: comment.article_slug,
  });

  if (result === 'duplicate') {
    return NextResponse.json({ status: 'already_reported' }, { status: 200 });
  }

  if (result !== 'created') {
    return apiError({ status: 500, code: 'COMMENT_REPORT_FAILED', message: 'Prijava nije spremljena. Pokušajte ponovno.' });
  }

  return NextResponse.json({ status: 'reported' }, { status: 201 });
}
