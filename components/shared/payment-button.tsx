'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/payment';

interface PaymentButtonProps {
  bookingId: string;
  amount: number; // in cents
  disabled?: boolean;
}

export function PaymentButton({ bookingId, amount, disabled }: PaymentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Greška pri kreiranju plaćanja.');
        return;
      }

      router.push(data.url);
    } catch {
      toast.error('Greška pri povezivanju sa Stripe-om.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full gap-2"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Obrada...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Plati {formatCurrency(amount)}
        </>
      )}
    </Button>
  );
}
