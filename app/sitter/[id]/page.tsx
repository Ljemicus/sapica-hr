import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SitterProfileContent } from './sitter-profile-content';

interface SitterPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SitterPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.from('users').select('name, city').eq('id', id).single();

  return {
    title: user ? `${user.name} — Sitter u ${user.city || 'Hrvatskoj'}` : 'Sitter profil',
    description: user ? `Pogledajte profil sittera ${user.name}. Rezervirajte uslugu čuvanja ljubimaca.` : '',
  };
}

export default async function SitterPage({ params }: SitterPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [profileRes, reviewsRes, availabilityRes] = await Promise.all([
    supabase
      .from('sitter_profiles')
      .select('*, user:users!sitter_profiles_user_id_fkey(*)')
      .eq('user_id', id)
      .single(),
    supabase
      .from('reviews')
      .select('*, reviewer:users!reviews_reviewer_id_fkey(name, avatar_url), booking:bookings(service_type)')
      .eq('reviewee_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('availability')
      .select('*')
      .eq('sitter_id', id)
      .eq('available', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date'),
  ]);

  if (!profileRes.data) return notFound();

  return (
    <SitterProfileContent
      profile={profileRes.data}
      reviews={reviewsRes.data || []}
      availability={availabilityRes.data || []}
    />
  );
}
