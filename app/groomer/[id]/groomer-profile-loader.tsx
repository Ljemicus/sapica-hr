'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Groomer } from '@/lib/types';
import { GroomerProfile } from './groomer-profile';

interface GroomerReview {
  id: string;
  groomer_id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface GroomerPageData {
  groomer: Groomer | null;
  reviews: GroomerReview[];
  availableDates: string[];
}

interface GroomerProfileLoaderProps {
  id: string;
  initialGroomer: Groomer;
}

export function GroomerProfileLoader({ id, initialGroomer }: GroomerProfileLoaderProps) {
  const [data, setData] = useState<GroomerPageData>({
    groomer: initialGroomer,
    reviews: [],
    availableDates: [],
  });
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/public/groomers/${id}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load groomer profile (${response.status})`);
        }
        return response.json() as Promise<GroomerPageData>;
      })
      .then((payload) => {
        if (!cancelled && payload.groomer) {
          setData(payload);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('missing');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const availableDatesSet = useMemo(() => new Set<string>(data.availableDates), [data.availableDates]);

  if (status === 'missing') {
    return (
      <section className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20">
        <div className="detail-section-card p-7 md:p-8">
          <h2 className="text-2xl font-extrabold font-[var(--font-heading)] mb-3">Profil trenutno nije dostupan</h2>
          <p className="text-muted-foreground leading-relaxed">
            Nismo uspjeli učitati podatke o groomeru. Pokušajte ponovno malo kasnije ili se vratite na listu groomera.
          </p>
        </div>
      </section>
    );
  }

  return (
    <GroomerProfile
      groomer={data.groomer ?? initialGroomer}
      reviews={data.reviews}
      availableDates={availableDatesSet}
    />
  );
}
