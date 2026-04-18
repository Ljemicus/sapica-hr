'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Trainer, TrainingProgram } from '@/lib/types';
import { TrainerProfile } from './trainer-profile';

interface TrainerReview {
  id: string;
  trainer_id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface TrainerPageData {
  trainer: Trainer | null;
  programs: TrainingProgram[];
  reviews: TrainerReview[];
  availableDates: string[];
}

interface TrainerProfileLoaderProps {
  id: string;
  initialTrainer: Trainer;
}

export function TrainerProfileLoader({ id, initialTrainer }: TrainerProfileLoaderProps) {
  const [data, setData] = useState<TrainerPageData>({
    trainer: initialTrainer,
    programs: [],
    reviews: [],
    availableDates: [],
  });
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/public/trainers/${id}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load trainer profile (${response.status})`);
        }
        return response.json() as Promise<TrainerPageData>;
      })
      .then((payload) => {
        if (!cancelled && payload.trainer) {
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
            Nismo uspjeli učitati podatke o treneru. Pokušajte ponovno malo kasnije ili se vratite na listu trenera.
          </p>
        </div>
      </section>
    );
  }

  return (
    <TrainerProfile
      trainer={data.trainer ?? initialTrainer}
      programs={data.programs}
      reviews={data.reviews}
      availableDates={availableDatesSet}
    />
  );
}
