'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wallet, TrendingUp, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/payment';

interface BalanceData {
  available: number;
  pending: number;
}

export function SitterEarnings() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  async function fetchBalance() {
    try {
      const res = await fetch('/api/payments/account-status');
      if (!res.ok) return;

      const status = await res.json();
      if (!status.connected) {
        setBalance({ available: 0, pending: 0 });
        return;
      }

      // Balance comes from the account status endpoint indirectly;
      // for now show zeros until real balance endpoint is added
      setBalance({ available: 0, pending: 0 });
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  async function openDashboard() {
    setDashboardLoading(true);
    try {
      const res = await fetch('/api/payments/dashboard-link', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Greška pri otvaranju dashboarda.');
        return;
      }

      window.open(data.url, '_blank');
    } catch {
      toast.error('Greška pri povezivanju sa Stripe-om.');
    } finally {
      setDashboardLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Zarada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Dostupno
            </div>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(balance?.available ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Na čekanju
            </div>
            <p className="text-xl font-bold text-amber-600">
              {formatCurrency(balance?.pending ?? 0)}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={openDashboard}
          disabled={dashboardLoading}
        >
          {dashboardLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          Otvori Stripe Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}
