import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import {
  getTrainerById as mockGetTrainer,
  getTrainers as mockGetTrainers,
  getTrainingProgramsForTrainer as mockGetPrograms,
  getTrainerReviews as mockGetTrainerReviews,
} from '@/lib/mock-data';
import type { Trainer, TrainingProgram, TrainingType } from '@/lib/types';

interface TrainerFilters {
  city?: string;
  type?: TrainingType;
}

interface TrainerReview {
  id: string;
  trainer_id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  comment: string;
  created_at: string;
}

export async function getTrainers(filters?: TrainerFilters): Promise<Trainer[]> {
  if (!isSupabaseConfigured()) {
    return mockGetTrainers(filters ? { city: filters.city, type: filters.type } : undefined);
  }
  try {
    const supabase = await createClient();
    let query = supabase.from('trainers').select('*');

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    const { data, error } = await query;
    if (error || !data) return mockGetTrainers(filters ? { city: filters.city, type: filters.type } : undefined);

    let results = data as Trainer[];

    if (filters?.type) {
      results = results.filter(
        (t) => Array.isArray(t.specializations) && t.specializations.includes(filters.type!)
      );
    }

    results.sort((a, b) => b.rating - a.rating);
    return results;
  } catch {
    return mockGetTrainers(filters ? { city: filters.city, type: filters.type } : undefined);
  }
}

export async function getTrainer(id: string): Promise<Trainer | null> {
  if (!isSupabaseConfigured()) {
    return mockGetTrainer(id) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('trainers').select('*').eq('id', id).single();
    if (error || !data) return mockGetTrainer(id) ?? null;
    return data as Trainer;
  } catch {
    return mockGetTrainer(id) ?? null;
  }
}

export async function getPrograms(trainerId: string): Promise<TrainingProgram[]> {
  if (!isSupabaseConfigured()) {
    return mockGetPrograms(trainerId);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('trainer_id', trainerId);
    if (error || !data) return mockGetPrograms(trainerId);
    return data as TrainingProgram[];
  } catch {
    return mockGetPrograms(trainerId);
  }
}

export async function getTrainerReviews(trainerId: string): Promise<TrainerReview[]> {
  if (!isSupabaseConfigured()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockGetTrainerReviews(trainerId) as any[];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('trainer_reviews')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    if (error || !data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockGetTrainerReviews(trainerId) as any[];
    }
    return data as TrainerReview[];
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockGetTrainerReviews(trainerId) as any[];
  }
}
