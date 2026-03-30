'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function CommentForm() {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Komentar ne može biti prazan.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Komentar je objavljen!');
      setContent('');
      setSubmitting(false);
    }, 500);
  };

  return (
    <>
      <h3 className="font-semibold text-sm mb-3">Dodaj komentar</h3>
      <Textarea
        placeholder="Napišite svoj komentar..."
        className="min-h-[80px] mb-3 rounded-xl"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end">
        <Button
          className="bg-orange-500 hover:bg-orange-600 rounded-xl"
          onClick={handleSubmit}
          disabled={submitting}
        >
          <Send className="h-4 w-4 mr-2" />
          {submitting ? 'Objavljujem...' : 'Objavi'}
        </Button>
      </div>
    </>
  );
}
