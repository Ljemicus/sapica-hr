import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { appLogger } from '@/lib/logger';

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });

  const supabase = await createClient();

  // Verify ownership
  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!trainer) {
    return NextResponse.json({ error: 'Trener profil nije pronađen' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Neispravan zahtjev' }, { status: 400 });

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const VALID_SPECIALIZATIONS = new Set(['osnovna', 'napredna', 'agility', 'ponasanje', 'stenci']);

  const updates: Record<string, unknown> = {};

  if (typeof body.name === 'string' && body.name.trim().length >= 2) {
    updates.name = body.name.trim();
  }
  if (typeof body.bio === 'string') {
    updates.bio = body.bio.trim();
  }
  if (typeof body.city === 'string' && body.city.trim()) {
    updates.city = body.city.trim();
  }
  if (typeof body.phone === 'string') {
    updates.phone = body.phone.trim() || null;
  }
  if (typeof body.email === 'string') {
    const trimmed = body.email.trim();
    if (!trimmed || EMAIL_RE.test(trimmed)) {
      updates.email = trimmed || null;
    }
  }
  if (typeof body.address === 'string') {
    updates.address = body.address.trim() || null;
  }
  if (Array.isArray(body.specializations) && body.specializations.length > 0) {
    const validSpecializations = body.specializations.filter(
      (s: unknown) => typeof s === 'string' && VALID_SPECIALIZATIONS.has(s)
    );
    if (validSpecializations.length > 0) {
      updates.specializations = validSpecializations;
    }
  }
  if (typeof body.price_per_hour === 'number' && body.price_per_hour >= 0) {
    updates.price_per_hour = body.price_per_hour;
  }
  if (Array.isArray(body.certificates)) {
    const cleanCertificates = body.certificates
      .filter((cert: unknown) => typeof cert === 'string')
      .map((cert: string) => cert.trim())
      .filter((cert: string) => cert.length > 0 && cert.length <= 120)
      .slice(0, 20);
    updates.certificates = cleanCertificates;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nema promjena' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('trainers')
    .update(updates)
    .eq('id', trainer.id)
    .select('id, name, city, specializations, price_per_hour, certificates, rating, review_count, bio, certified, user_id, phone, email, address')
    .single();

  if (error) {
    appLogger.error('trainerProfile.update', 'db write failed', { error: error.message, userId: user.id });
    return NextResponse.json({ error: 'Greška pri spremanju' }, { status: 500 });
  }

  return NextResponse.json({ trainer: data });
}
