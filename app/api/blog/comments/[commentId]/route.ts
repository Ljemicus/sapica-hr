import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { requireAdmin } from '@/lib/admin-guard';
import { deleteArticleComment, getArticleCommentById } from '@/lib/db';

interface RouteContext {
  params: Promise<{ commentId: string }>;
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const { commentId } = await params;
  const comment = await getArticleCommentById(commentId);

  if (!comment) {
    return apiError({ status: 404, code: 'COMMENT_NOT_FOUND', message: 'Komentar nije pronađen.' });
  }

  const deleted = await deleteArticleComment(commentId);
  if (!deleted) {
    return apiError({ status: 500, code: 'COMMENT_DELETE_FAILED', message: 'Komentar nije obrisan. Pokušajte ponovno.' });
  }

  return NextResponse.json({ id: commentId, status: 'deleted', deleted_by: auth.user.id });
}
