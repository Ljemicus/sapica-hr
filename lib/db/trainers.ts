import { createClient } from '@/lib/supabase/server';
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
  try {
    const supabase = await createClient();
    let query = supabase.from('trainers').select('*');

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let results = data as Trainer[];

    // Filter JSONB specializations in JS
    if (filters?.type) {
      results = results.filter(
        (t) => Array.isArray(t.specializations) && t.specializations.includes(filters.type!)
      );
    }

    // Sort by rating descending
    results.sort((a, b) => b.rating - a.rating);

    return results;
  } catch {
    return [];
  }
}

export async function getTrainer(id: string): Promise<Trainer | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('trainers').select('*').eq('id', id).single();
    if (error || !data) return null;
    return data as Trainer;
  } catch {
    return null;
  }
}

export async function getPrograms(trainerId: string): Promise<TrainingProgram[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('trainer_id', trainerId);
    if (error || !data) return [];
    return data as TrainingProgram[];
  } catch {
    return [];
  }
}

export async function getTrainerReviews(trainerId: string): Promise<TrainerReview[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('trainer_reviews')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as TrainerReview[];
  } catch {
    return [];
  }
}
