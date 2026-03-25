'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Filter,
} from 'lucide-react';

export type TransactionType = 'income' | 'expense' | 'refund';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
}

const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Prihod',
  expense: 'Rashod',
  refund: 'Povrat',
};

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  completed: { label: 'Završeno', variant: 'default' },
  pending: { label: 'Na čekanju', variant: 'secondary' },
  failed: { label: 'Neuspjelo', variant: 'destructive' },
};

const TYPE_ICON: Record<TransactionType, typeof ArrowDownLeft> = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  refund: RotateCcw,
};

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? transactions
        : transactions.filter((t) => t.type === filter),
    [transactions, filter]
  );

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const pendingAmount = useMemo(
    () =>
      transactions
        .filter((t) => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  function formatEUR(cents: number) {
    return new Intl.NumberFormat('hr-HR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transakcije</CardTitle>
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="h-3 w-3" />
          </div>
          {(['all', 'income', 'expense', 'refund'] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
            >
              {type === 'all' ? 'Sve' : TYPE_LABELS[type]}
            </Button>
          ))}
        </div>
        <div className="flex gap-4 pt-2 text-sm">
          <span>
            Ukupna zarada:{' '}
            <span className="font-semibold text-green-600">
              {formatEUR(totalIncome)}
            </span>
          </span>
          <span>
            Na čekanju:{' '}
            <span className="font-semibold text-amber-600">
              {formatEUR(pendingAmount)}
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Nema transakcija za prikaz.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => {
              const Icon = TYPE_ICON[t.type];
              const statusCfg = STATUS_CONFIG[t.status];
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        t.type === 'income'
                          ? 'bg-green-100 text-green-600'
                          : t.type === 'refund'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-red-100 text-red-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleDateString('hr-HR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    <span
                      className={`font-semibold ${
                        t.type === 'income'
                          ? 'text-green-600'
                          : t.type === 'refund'
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatEUR(t.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
