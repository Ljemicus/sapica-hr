'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 py-12">
      <Card className="w-full text-center">
        <CardContent className="pt-8 pb-4">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Plaćanje uspješno!</h1>
          <p className="text-muted-foreground">
            Vaša rezervacija je potvrđena i plaćena.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Referenca: <span className="font-mono font-medium">{bookingId}</span>
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Link
            href="/dashboard/vlasnik"
            className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
          >
            Povratak na dashboard
          </Link>
          <Link
            href="/pretraga"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            Pretraži čuvare
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
