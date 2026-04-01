'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  type PublisherProfileType,
  PUBLISHER_PROFILE_TYPE_LABELS,
  PUBLISHER_PROFILE_TYPE_EMOJI,
  PUBLISHER_PROFILE_TYPE_DESCRIPTIONS,
} from '@/lib/types';

const PROFILE_TYPES: PublisherProfileType[] = [
  'vlasnik',
  'čuvar',
  'groomer',
  'trener',
  'uzgajivač',
  'veterinar',
];

export default function PublisherTypePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<PublisherProfileType | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/publisher-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selected }),
      });
      if (res.ok) {
        router.push('/dashboard/profile');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white dark:from-teal-950/10 dark:to-background">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight font-[var(--font-heading)]">
            Dobrodošli u PetPark!
          </h1>
          <p className="text-gray-500 text-lg">
            Odaberite vrstu profila kako bismo prilagodili vaše iskustvo.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PROFILE_TYPES.map((type) => {
            const isActive = selected === type;
            return (
              <Card
                key={type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isActive
                    ? 'ring-2 ring-teal-500 bg-teal-50/60 dark:bg-teal-950/20'
                    : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40'
                }`}
                onClick={() => setSelected(type)}
              >
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="text-3xl" role="img" aria-label={PUBLISHER_PROFILE_TYPE_LABELS[type]}>
                    {PUBLISHER_PROFILE_TYPE_EMOJI[type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {PUBLISHER_PROFILE_TYPE_LABELS[type]}
                      </h3>
                      {isActive && (
                        <Check className="h-5 w-5 text-teal-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {PUBLISHER_PROFILE_TYPE_DESCRIPTIONS[type]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            disabled={!selected || loading}
            onClick={handleContinue}
            className="min-w-[200px]"
          >
            {loading ? 'Spremam...' : 'Nastavi'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
