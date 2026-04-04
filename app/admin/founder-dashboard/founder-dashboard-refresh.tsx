'use client';

import { useTransition } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { refreshFounderDashboard } from './actions';

export function FounderDashboardRefresh() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await refreshFounderDashboard();
      })}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
      Osvježi
    </Button>
  );
}
