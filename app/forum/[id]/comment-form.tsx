'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { ForumComment } from '@/lib/types';

interface CommentFormProps {
  topicId: string;
  onSuccess?: (comment: ForumComment) => void;
}

export function CommentForm({ topicId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Komentar ne može biti prazan.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/topics/${topicId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.status === 401) {
        toast.error('Prijavite se da biste komentirali.');
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Server error');
      }
      const data = await res.json() as { comment: ForumComment };
      toast.success('Komentar je objavljen!');
      setContent('');
      onSuccess?.(data.comment);
    } catch (err) {
      toast.error('Greška pri objavi komentara.');
      console.error('CommentForm error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-warm-orange mb-3 flex items-center gap-1.5">
        <Send className="h-3 w-3" />
        Dodaj komentar
      </p>
      <Textarea
        placeholder="Napišite svoj komentar..."
        className="min-h-[100px] mb-4 rounded-xl border-border/40 focus-visible:ring-orange-500"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end">
        <Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 rounded-xl h-11 px-6 font-semibold btn-hover" onClick={handleSubmit} disabled={submitting}>
          <Send className="h-4 w-4 mr-2" />
          {submitting ? 'Objavljujem...' : 'Objavi'}
        </Button>
      </div>
    </>
  );
}
