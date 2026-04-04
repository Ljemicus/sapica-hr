'use client';

import { useState } from 'react';
import { EyeOff, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

type Action = 'hide' | 'unhide' | 'delete';

interface ForumModerateControlsProps {
  targetType: 'topic' | 'comment';
  targetId: string;
  status?: 'active' | 'hidden' | 'locked';
}

export function ForumModerateControls({ targetType, targetId, status = 'active' }: ForumModerateControlsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!user || user.role !== 'admin') return null;

  const isHidden = status === 'hidden';

  async function moderate(action: Action) {
    if (action === 'delete' && !confirm(`Obrisati ovaj ${targetType === 'topic' ? 'post' : 'komentar'}?`)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/forum/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed');
      }
      toast.success(
        action === 'hide' ? 'Skriveno' :
        action === 'unhide' ? 'Vraćeno' :
        'Obrisano'
      );
      router.refresh();
    } catch (err) {
      toast.error('Akcija nije uspjela');
      console.error('Moderate error:', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className={`inline-flex items-center gap-0.5 ${busy ? 'opacity-40 pointer-events-none' : ''}`}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); moderate(isHidden ? 'unhide' : 'hide'); }}
        className="p-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30 text-muted-foreground hover:text-orange-600 transition-colors"
        title={isHidden ? 'Prikaži' : 'Sakrij'}
      >
        {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); moderate('delete'); }}
        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors"
        title="Obriši"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
