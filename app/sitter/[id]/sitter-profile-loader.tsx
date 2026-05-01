'use client';

import { useEffect, useState } from 'react';
import type { PublicSitterPageData, PublicSitterProfile } from '@/lib/public/provider-profile-sanitizers';
import { SitterProfileContent } from './sitter-profile-content';

interface SitterProfileLoaderProps {
  id: string;
  initialProfile: PublicSitterProfile;
}

export function SitterProfileLoader({ id, initialProfile }: SitterProfileLoaderProps) {
  const [data, setData] = useState<PublicSitterPageData>({
    profile: initialProfile,
    reviews: [],
    availability: [],
  });
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/public/sitters/${id}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Failed to load sitter profile (${response.status})`);
        return response.json() as Promise<PublicSitterPageData>;
      })
      .then((payload) => {
        if (!cancelled && payload.profile) {
          setData(payload);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('missing');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'missing') {
    return (
      <section className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20">
        <div className="detail-section-card p-7 md:p-8">
          <h2 className="text-2xl font-extrabold font-[var(--font-heading)] mb-3">Profil trenutno nije dostupan</h2>
          <p className="text-muted-foreground leading-relaxed">
            Nismo uspjeli učitati podatke o sitteru. Pokušajte ponovno malo kasnije ili se vratite na pretragu.
          </p>
        </div>
      </section>
    );
  }

  return (
    <SitterProfileContent
      profile={(data.profile ?? initialProfile) as any}
      reviews={data.reviews}
      availability={data.availability}
      bookingPets={[]}
      bookingUserId={null}
    />
  );
}
