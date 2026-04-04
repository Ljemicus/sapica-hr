'use client';

import { useTransition } from 'react';
import { BarChart3, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { triggerFounderKpiDigest, triggerFounderOpsAudit } from './actions';

export function FounderDashboardActions() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(async () => {
          try {
            const result = await triggerFounderKpiDigest();
            toast.success(result.slackSent ? 'KPI digest poslan na Slack.' : 'KPI digest generiran. Slack nije poslan.');
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'KPI digest nije uspio.');
          }
        })}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Trigger KPI digest
      </Button>

      <Button
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(async () => {
          try {
            const result = await triggerFounderOpsAudit();
            toast.success(
              result.findingCount === 0
                ? 'Ops audit clean. Nema aktivnih nalaza.'
                : `Ops audit gotov. Findings: ${result.findingCount}, alerts: ${result.alertsDispatched}.`
            );
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ops audit nije uspio.');
          }
        })}
      >
        <ShieldAlert className="h-4 w-4 mr-2" />
        Trigger ops audit
      </Button>
    </div>
  );
}
