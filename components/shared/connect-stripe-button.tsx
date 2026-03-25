'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LinkIcon, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface AccountStatusResponse {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export function ConnectStripeButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AccountStatusResponse | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch('/api/payments/connect');
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      // Silently fail — UI will show default state
    } finally {
      setFetching(false);
    }
  }

  async function handleConnect() {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/connect', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Greška pri povezivanju.');
        return;
      }

      window.location.href = data.onboardingUrl;
    } catch {
      toast.error('Greška pri povezivanju sa Stripe-om.');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Učitavanje statusa...
      </div>
    );
  }

  if (status?.connected && status.chargesEnabled) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Stripe povezan
        </Badge>
      </div>
    );
  }

  if (status?.connected && !status.chargesEnabled) {
    return (
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit gap-1">
          <Clock className="h-3 w-3" />
          Onboarding u tijeku
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnect}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          Dovrši postavljanje
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Povezivanje...
        </>
      ) : (
        <>
          <LinkIcon className="h-4 w-4" />
          Poveži bankovni račun
        </>
      )}
    </Button>
  );
}
