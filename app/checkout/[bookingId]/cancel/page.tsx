'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CheckoutCancelPage({
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
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Plaćanje otkazano</h1>
          <p className="text-muted-foreground">
            Vaše plaćanje nije provedeno. Rezervacija ostaje aktivna.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Link
            href={`/checkout/${bookingId}`}
            className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
          >
            Pokušaj ponovo
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            Povratak na dashboard
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
