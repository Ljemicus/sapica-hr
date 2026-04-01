import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import {
  getTrainerById as mockGetTrainer,
  getTrainers as mockGetTrainers,
  getTrainingProgramsForTrainer as mockGetPrograms,
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
    let query = supabase.from('trainers').select('id, name, city, specializations, price_per_hour, certificates, rating, reviews, bio, certified');

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let results = data as Trainer[];

    if (filters?.type) {
      results = results.filter(
        (t) => Array.isArray(t.specializations) && t.specializations.includes(filters.type!)
      );
    }

    results.sort((a, b) => b.rating - a.rating);
    return results;
  } catch {
    return [];
  }
}

export async function getTrainer(id: string): Promise<Trainer | null> {
  if (!isSupabaseConfigured()) {
    return mockGetTrainer(id) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('trainers').select('id, name, city, specializations, price_per_hour, certificates, rating, reviews, bio, certified').eq('id', id).single();
    if (error || !data) return null;
    return data as Trainer;
  } catch {
    return null;
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
      .select('id, trainer_id, name, type, duration_weeks, sessions, price, description')
      .eq('trainer_id', trainerId);
    if (error || !data) return [];
    return data as TrainingProgram[];
  } catch {
    return [];
  }
}

export async function getTrainerReviews(trainerId: string): Promise<TrainerReview[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('trainer_reviews')
      .select('id, trainer_id, author_name, author_initial, rating, comment, created_at')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    if (error || !data) {
      return [];
    }
    return data as TrainerReview[];
  } catch {
    return [];
  }
}
