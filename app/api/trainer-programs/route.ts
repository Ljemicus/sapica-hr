import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createProgram, updateProgram, deleteProgram } from '@/lib/db';
import { appLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import type { TrainingType } from '@/lib/types';

const VALID_TYPES = new Set<string>(['osnovna', 'napredna', 'agility', 'ponasanje', 'stenci']);
const MAX_PROGRAMS = 20;

async function getTrainerForUser(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data;
}

function validateProgramBody(body: Record<string, unknown>) {
  const errors: string[] = [];

  if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 120) {
    errors.push('Naziv programa mora imati 2-120 znakova');
  }
  if (typeof body.type !== 'string' || !VALID_TYPES.has(body.type)) {
    errors.push('Neispravna vrsta treninga');
  }
  if (typeof body.duration_weeks !== 'number' || body.duration_weeks < 1 || body.duration_weeks > 52) {
    errors.push('Trajanje mora biti 1-52 tjedana');
  }
  if (typeof body.sessions !== 'number' || body.sessions < 1 || body.sessions > 200) {
    errors.push('Broj sesija mora biti 1-200');
  }
  if (typeof body.price !== 'number' || body.price < 0 || body.price > 100000) {
    errors.push('Cijena mora biti 0-100000');
  }
  if (typeof body.description !== 'string' || body.description.trim().length < 5 || body.description.trim().length > 2000) {
    errors.push('Opis mora imati 5-2000 znakova');
  }

  return errors;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`trainer:programs:write:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Previše zahtjeva. Pokušajte kasnije.' }, { status: 429 });
  }

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });

  const trainer = await getTrainerForUser(user.id);
  if (!trainer) return NextResponse.json({ error: 'Trener profil nije pronađen' }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Neispravan zahtjev' }, { status: 400 });

  const errors = validateProgramBody(body);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors[0] }, { status: 400 });
  }

  // Check program count limit
  const supabase = await createClient();
  const { count } = await supabase
    .from('training_programs')
    .select('id', { count: 'exact', head: true })
    .eq('trainer_id', trainer.id);

  if (count !== null && count >= MAX_PROGRAMS) {
    return NextResponse.json({ error: `Maksimalan broj programa je ${MAX_PROGRAMS}` }, { status: 400 });
  }

  const program = await createProgram(trainer.id, {
    name: (body.name as string).trim(),
    type: body.type as TrainingType,
    duration_weeks: body.duration_weeks as number,
    sessions: body.sessions as number,
    price: body.price as number,
    description: (body.description as string).trim(),
  });

  if (!program) {
    appLogger.error('trainerPrograms.create', 'db write failed', { userId: user.id });
    return NextResponse.json({ error: 'Greška pri stvaranju programa' }, { status: 500 });
  }

  return NextResponse.json({ program }, { status: 201 });
}

export async function PATCH(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`trainer:programs:write:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Previše zahtjeva. Pokušajte kasnije.' }, { status: 429 });
  }

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });

  const trainer = await getTrainerForUser(user.id);
  if (!trainer) return NextResponse.json({ error: 'Trener profil nije pronađen' }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Neispravan zahtjev' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (typeof body.name === 'string' && body.name.trim().length >= 2 && body.name.trim().length <= 120) {
    updates.name = body.name.trim();
  }
  if (typeof body.type === 'string' && VALID_TYPES.has(body.type)) {
    updates.type = body.type;
  }
  if (typeof body.duration_weeks === 'number' && body.duration_weeks >= 1 && body.duration_weeks <= 52) {
    updates.duration_weeks = body.duration_weeks;
  }
  if (typeof body.sessions === 'number' && body.sessions >= 1 && body.sessions <= 200) {
    updates.sessions = body.sessions;
  }
  if (typeof body.price === 'number' && body.price >= 0 && body.price <= 100000) {
    updates.price = body.price;
  }
  if (typeof body.description === 'string' && body.description.trim().length >= 5 && body.description.trim().length <= 2000) {
    updates.description = body.description.trim();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nema promjena' }, { status: 400 });
  }

  const program = await updateProgram(body.id as string, trainer.id, updates);

  if (!program) {
    appLogger.error('trainerPrograms.update', 'db write failed', { userId: user.id, programId: body.id });
    return NextResponse.json({ error: 'Greška pri ažuriranju programa' }, { status: 500 });
  }

  return NextResponse.json({ program });
}

export async function DELETE(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`trainer:programs:write:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Previše zahtjeva. Pokušajte kasnije.' }, { status: 429 });
  }

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });

  const trainer = await getTrainerForUser(user.id);
  if (!trainer) return NextResponse.json({ error: 'Trener profil nije pronađen' }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Neispravan zahtjev' }, { status: 400 });
  }

  const success = await deleteProgram(body.id as string, trainer.id);
  if (!success) {
    appLogger.error('trainerPrograms.delete', 'db delete failed', { userId: user.id, programId: body.id });
    return NextResponse.json({ error: 'Greška pri brisanju programa' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
