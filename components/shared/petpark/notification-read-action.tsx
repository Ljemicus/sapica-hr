'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function NotificationReadAction({ notificationId, read }: { notificationId: string; read: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (read) return null;

  async function markRead() {
    setPending(true);
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
      if (response.ok) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={markRead} className="mt-3 px-0 text-[color:var(--pp-color-orange-primary)] hover:bg-transparent">
      {pending ? 'Označavam…' : 'Označi kao pročitano'}
    </Button>
  );
}
