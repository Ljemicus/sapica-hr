import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { appLogger } from '@/lib/logger';

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });

  const supabase = await createClient();

  // Verify ownership
  const { data: groomer } = await supabase
    .from('groomers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!groomer) {
    return NextResponse.json({ error: 'Groomer profil nije pronađen' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Neispravan zahtjev' }, { status: 400 });

  const VALID_SERVICES = new Set(['sisanje', 'kupanje', 'trimanje', 'nokti', 'cetkanje']);
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  if (typeof body.specialization === 'string' && ['psi', 'macke', 'oba'].includes(body.specialization)) {
    updates.specialization = body.specialization;
  }
  if (Array.isArray(body.services) && body.services.length > 0) {
    const validServices = body.services.filter((s: unknown) => typeof s === 'string' && VALID_SERVICES.has(s));
    if (validServices.length > 0) {
      updates.services = validServices;
    }
  }
  if (body.prices && typeof body.prices === 'object' && !Array.isArray(body.prices)) {
    const cleanPrices: Record<string, number> = {};
    for (const [key, val] of Object.entries(body.prices)) {
      if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
        cleanPrices[key] = val;
      }
    }
    if (Object.keys(cleanPrices).length > 0) {
      updates.prices = cleanPrices;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nema promjena' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('groomers')
    .update(updates)
    .eq('id', groomer.id)
    .select('id, name, city, services, prices, rating, review_count, bio, verified, specialization, user_id, phone, email, address, working_hours')
    .single();

  if (error) {
    appLogger.error('groomerProfile.update', 'db write failed', { error: error.message, userId: user.id });
    return NextResponse.json({ error: 'Greška pri spremanju' }, { status: 500 });
  }

  return NextResponse.json({ groomer: data });
}
