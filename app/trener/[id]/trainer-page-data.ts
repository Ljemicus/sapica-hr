import { headers } from 'next/headers';
import { cache } from 'react';
import type { Trainer, TrainingProgram } from '@/lib/types';

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

async function resolveBaseUrl() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? (host?.includes('localhost') || host?.startsWith('127.0.0.1') ? 'http' : 'https');

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';
}

export const getTrainerPageData = cache(async (id: string): Promise<TrainerPageData> => {
  const baseUrl = await resolveBaseUrl();
  const response = await fetch(`${baseUrl}/api/public/trainers/${id}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return {
      trainer: null,
      programs: [],
      reviews: [],
      availableDates: [],
    };
  }

  if (!response.ok) {
    throw new Error(`Failed to load trainer page data: ${response.status}`);
  }

  return response.json() as Promise<TrainerPageData>;
});
