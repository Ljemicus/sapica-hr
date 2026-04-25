'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Loader2, Flag, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { BlogComment, UserRole } from '@/lib/types';

const MAX_COMMENT_LENGTH = 1000;

interface BlogCommentsProps {
  articleSlug: string;
  initialComments: BlogComment[];
  currentUser: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: UserRole;
  } | null;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const palette = [
    'bg-orange-500',
    'bg-amber-500',
    'bg-teal-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  const charCode = name.charCodeAt(0) || 0;
  return palette[charCode % palette.length];
}

function formatCommentDate(value: string): string {
  return new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function BlogComments({ articleSlug, initialComments, currentUser }: BlogCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingReportId, setPendingReportId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [reportedCommentIds, setReportedCommentIds] = useState<string[]>([]);

  const trimmedLength = useMemo(() => content.trim().length, [content]);
  const isAdmin = currentUser?.role === 'admin';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = content.trim();
    if (!trimmed) {
      setError('Komentar ne može biti prazan.');
      return;
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setError(`Komentar može imati najviše ${MAX_COMMENT_LENGTH} znakova.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_slug: articleSlug,
          content: trimmed,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error?.message || 'Komentar nije spremljen.');
        return;
      }

      const createdComment = payload as BlogComment;
      setComments((prev) => [...prev, createdComment]);
      setContent('');
      setSuccess('Komentar je objavljen.');
    } catch {
      setError('Došlo je do greške. Pokušajte ponovno.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async (comment: BlogComment) => {
    if (!currentUser) {
      setError('Morate biti prijavljeni kako biste prijavili komentar.');
      return;
    }

    setError(null);
    setSuccess(null);
    setPendingReportId(comment.id);

    try {
      const response = await fetch(`/api/blog/comments/${comment.id}/report`, {
        method: 'POST',
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error?.message || 'Prijava nije spremljena.');
        return;
      }

      setReportedCommentIds((prev) => (prev.includes(comment.id) ? prev : [...prev, comment.id]));
      setSuccess(payload?.status === 'already_reported' ? 'Komentar je već prijavljen.' : 'Hvala, komentar je prijavljen na pregled.');
    } catch {
      setError('Došlo je do greške. Pokušajte ponovno.');
    } finally {
      setPendingReportId(null);
    }
  };

  const handleDelete = async (comment: BlogComment) => {
    if (!isAdmin) {
      setError('Samo admin može obrisati komentar.');
      return;
    }

    const confirmed = window.confirm('Obrisati ovaj komentar? Ovo ne možete vratiti jednim klikom.');
    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);
    setPendingDeleteId(comment.id);

    try {
      const response = await fetch(`/api/blog/comments/${comment.id}`, {
        method: 'DELETE',
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error?.message || 'Komentar nije obrisan.');
        return;
      }

      setComments((prev) => prev.filter((item) => item.id !== comment.id));
      setSuccess('Komentar je obrisan.');
    } catch {
      setError('Došlo je do greške. Pokušajte ponovno.');
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <section className="mb-10" aria-labelledby="blog-comments-title">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 id="blog-comments-title" className="text-xl font-bold">
              Komentari
            </h2>
            <Badge className="bg-orange-50 text-orange-600 border-0 hover:bg-orange-50">
              {comments.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Podijelite iskustvo, pitanje ili savjet vezan uz članak.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card className="border border-dashed border-orange-200 bg-orange-50/40 shadow-none rounded-2xl">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Još nema komentara. Budite prvi koji će nešto napisati — internet će to preživjeti, ali članak će biti veseliji.
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => {
            const authorName = comment.user?.name || 'PetPark korisnik';
            const isOwnComment = currentUser?.id === comment.user_id;
            const canReport = Boolean(currentUser) && !isAdmin && !isOwnComment;
            const canDelete = Boolean(isAdmin);
            const isReported = reportedCommentIds.includes(comment.id);
            const isReporting = pendingReportId === comment.id;
            const isDeleting = pendingDeleteId === comment.id;

            return (
              <Card key={comment.id} className="border border-orange-100 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback className={`${getAvatarColor(authorName)} text-white font-semibold`}>
                        {getInitials(authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="font-semibold text-sm">{authorName}</p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">{formatCommentDate(comment.created_at)}</p>
                        </div>

                        {(canReport || canDelete) ? (
                          <div className="flex items-center gap-1">
                            {canReport ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isReporting || isReported}
                                onClick={() => void handleReport(comment)}
                                className="h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:bg-orange-50 hover:text-orange-600"
                              >
                                {isReporting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Flag className="mr-1 h-3 w-3" />}
                                {isReported ? 'Prijavljeno' : 'Prijavi'}
                              </Button>
                            ) : null}

                            {canDelete ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isDeleting}
                                onClick={() => void handleDelete(comment)}
                                className="h-7 rounded-full px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                {isDeleting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Trash2 className="mr-1 h-3 w-3" />}
                                Obriši
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="mt-6">
        {currentUser ? (
          <Card className="border border-orange-100 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="font-semibold text-sm mb-1">Komentirate kao {currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Držite komentar koristan, pristojan i bez caps-lock ratova.
                  </p>
                </div>

                <div className="space-y-2">
                  <Textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Napišite komentar..."
                    maxLength={MAX_COMMENT_LENGTH}
                    className="min-h-28 rounded-2xl border-orange-100 focus-visible:border-orange-300"
                    disabled={isSubmitting}
                  />
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className={trimmedLength > MAX_COMMENT_LENGTH ? 'text-red-600' : 'text-muted-foreground'}>
                      {trimmedLength}/{MAX_COMMENT_LENGTH}
                    </span>
                    <span className="text-muted-foreground">Komentari se objavljuju odmah.</span>
                  </div>
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                {success ? <p className="text-sm text-green-600">{success}</p> : null}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Spremam...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Objavi komentar
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm rounded-2xl">
            <CardContent className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Želite ostaviti komentar?</p>
                <p className="text-sm text-muted-foreground">
                  Prijavite se i uključite u raspravu ispod članka.
                </p>
              </div>
              <Link prefetch={false} href={`/prijava?redirect=${encodeURIComponent(`/blog/${articleSlug}`)}`}>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5">
                  Prijava
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
