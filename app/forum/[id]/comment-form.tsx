'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/context';
import type { ForumComment } from '@/lib/types';

interface CommentFormProps {
  topicId: string;
  onSuccess?: (comment: ForumComment) => void;
}

export function CommentForm({ topicId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const copy = {
    empty: isEn ? 'Comment cannot be empty.' : 'Komentar ne može biti prazan.',
    signIn: isEn ? 'Sign in to comment.' : 'Prijavite se da biste komentirali.',
    success: isEn ? 'Comment published!' : 'Komentar je objavljen!',
    error: isEn ? 'Error while publishing the comment.' : 'Greška pri objavi komentara.',
    title: isEn ? 'Add a comment' : 'Dodaj komentar',
    placeholder: isEn ? 'Write your comment...' : 'Napišite svoj komentar...',
    submitting: isEn ? 'Publishing...' : 'Objavljujem...',
    submit: isEn ? 'Publish' : 'Objavi',
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error(copy.empty);
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
        toast.error(copy.signIn);
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Server error');
      }
      const data = await res.json() as { comment: ForumComment };
      toast.success(copy.success);
      setContent('');
      onSuccess?.(data.comment);
      // Refresh server component to show new comment
      router.refresh();
    } catch (err) {
      toast.error(copy.error);
      console.error('CommentForm error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h3 className="font-semibold text-sm mb-3">{copy.title}</h3>
      <Textarea
        placeholder={copy.placeholder}
        className="min-h-[80px] mb-3 rounded-xl"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end">
        <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl" onClick={handleSubmit} disabled={submitting}>
          <Send className="h-4 w-4 mr-2" />
          {submitting ? copy.submitting : copy.submit}
        </Button>
      </div>
    </>
  );
}
