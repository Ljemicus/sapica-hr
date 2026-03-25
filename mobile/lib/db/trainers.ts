import { supabase } from '../supabase';
import { TrainingProgram, Sitter } from '../../types';

export async function getTrainingPrograms(): Promise<TrainingProgram[]> {
  const { data, error } = await supabase
    .from('training_programs')
    .select('*')
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  const iconMap: Record<string, string> = {
    osnovna: 'school',
    napredna: 'build',
    agility: 'fitness',
    ponasanje: 'build',
    stenci: 'star',
  };

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: `${row.price}€`,
    duration: `${row.duration_weeks} tjedana`,
    sessions: row.sessions,
    icon: iconMap[row.type] || 'school',
  }));
}

export async function getTrainers(): Promise<Sitter[]> {
  const { data, error } = await supabase
    .from('sitter_profiles')
    .select('*, users!inner(name, avatar_url)')
    .contains('services', ['Dresura'])
    .order('rating_avg', { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.user_id,
    name: row.users.name,
    avatar: row.users.avatar_url || '',
    rating: Number(row.rating_avg) || 0,
    reviewCount: row.review_count || 0,
    city: row.city || '',
    services: row.services || [],
    pricePerHour: row.prices?.perHour || 0,
    description: row.bio || '',
    verified: row.verified || false,
  }));
}
