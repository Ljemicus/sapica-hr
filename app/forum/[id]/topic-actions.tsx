'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface ForumTopicActionsProps {
  topicId?: string;
  commentId?: string;
  initialLikes: number;
  compact?: boolean;
}

export function ForumTopicActions({ topicId, commentId, initialLikes, compact = false }: ForumTopicActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [submitting, setSubmitting] = useState(false);

  const target = topicId
    ? `/api/forum/topics/${topicId}/like`
    : `/api/forum/comments/${commentId}/like`;

  const handleLike = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (res.status === 401) {
        toast.error('Prijavite se da biste ostavili lajk.');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.likes !== 'number') {
        throw new Error(data?.error || 'Like failed');
      }
      setLikes(data.likes);
    } catch (error) {
      console.error('Forum like failed:', error);
      toast.error('Lajk nije prošao.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={submitting}
      className={`flex items-center gap-1.5 text-xs transition-colors ${compact ? 'text-muted-foreground hover:text-red-500' : 'text-muted-foreground hover:text-red-500'} ${submitting ? 'opacity-60' : ''}`}
      aria-label="Like"
    >
      <Heart className={compact ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      {likes}
    </button>
  );
}
