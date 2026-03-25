import { supabase } from '../supabase';
import { GroomingService, Sitter } from '../../types';

export async function getGroomingServices(): Promise<GroomingService[]> {
  // Grooming services are a static catalog; the DB stores groomers not service definitions.
  // Return static list matching the app's UI expectations.
  return [
    { id: '1', name: 'Kupanje', description: 'Kompletno kupanje sa šamponom i sušenjem', price: '25€', duration: '45 min', icon: 'water' },
    { id: '2', name: 'Šišanje', description: 'Profesionalno šišanje po pasmini', price: '35€', duration: '60 min', icon: 'cut' },
    { id: '3', name: 'Trimanje noktiju', description: 'Sigurno i precizno skraćivanje noktiju', price: '10€', duration: '15 min', icon: 'hand-left' },
    { id: '4', name: 'Čišćenje ušiju', description: 'Nježno čišćenje i pregled ušiju', price: '12€', duration: '15 min', icon: 'ear' },
    { id: '5', name: 'Kompletna njega', description: 'Kupanje + šišanje + nokti + uši', price: '65€', duration: '90 min', icon: 'sparkles' },
    { id: '6', name: 'Četkanje dlake', description: 'Detaljno četkanje i uklanjanje čvorova', price: '15€', duration: '30 min', icon: 'brush' },
  ];
}

export async function getGroomers(): Promise<Sitter[]> {
  const { data, error } = await supabase
    .from('sitter_profiles')
    .select('*, users!inner(name, avatar_url)')
    .contains('services', ['Grooming'])
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
