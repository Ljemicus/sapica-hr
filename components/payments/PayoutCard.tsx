'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Clock, CheckCircle2 } from 'lucide-react';

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending';
}

interface PayoutCardProps {
  availableBalance: number;
  pendingBalance: number;
  recentPayouts?: Payout[];
  onRequestPayout?: () => void;
}

function formatEUR(cents: number) {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

const MOCK_PAYOUTS: Payout[] = [
  {
    id: 'po_1',
    date: '2026-03-20T10:00:00Z',
    amount: 850_00,
    status: 'completed',
  },
  {
    id: 'po_2',
    date: '2026-03-13T10:00:00Z',
    amount: 1200_00,
    status: 'completed',
  },
  {
    id: 'po_3',
    date: '2026-03-06T10:00:00Z',
    amount: 400_00,
    status: 'completed',
  },
];

export function PayoutCard({
  availableBalance,
  pendingBalance,
  recentPayouts = MOCK_PAYOUTS,
  onRequestPayout,
}: PayoutCardProps) {
  const [requesting, setRequesting] = useState(false);

  async function handleRequest() {
    setRequesting(true);
    // Mock delay
    await new Promise((r) => setTimeout(r, 1000));
    onRequestPayout?.();
    setRequesting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Isplate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Dostupno</p>
            <p className="text-xl font-bold text-green-600">
              {formatEUR(availableBalance)}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Na čekanju</p>
            <p className="text-xl font-bold text-amber-600">
              {formatEUR(pendingBalance)}
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleRequest}
          disabled={requesting || availableBalance === 0}
        >
          {requesting ? 'Obrada...' : 'Zatraži isplatu'}
        </Button>

        {recentPayouts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Zadnje isplate
            </p>
            {recentPayouts.slice(0, 3).map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  {payout.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                  <span>
                    {new Date(payout.date).toLocaleDateString('hr-HR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      payout.status === 'completed' ? 'default' : 'secondary'
                    }
                  >
                    {payout.status === 'completed' ? 'Isplaćeno' : 'Na čekanju'}
                  </Badge>
                  <span className="font-medium">
                    {formatEUR(payout.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
