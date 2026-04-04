import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createPublisherProfile, getPublisherProfile } from '@/lib/db/publisher-profiles';
import type { PublisherProfileType } from '@/lib/types';

const VALID_TYPES: PublisherProfileType[] = [
  'vlasnik', 'čuvar', 'groomer', 'trener', 'uzgajivač', 'veterinar', 'udomljavanje',
];

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });
  }

  const body = await request.json();
  const type = body.type as PublisherProfileType;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Nevažeća vrsta profila' }, { status: 400 });
  }

  // Check if profile already exists
  const existing = await getPublisherProfile(user.id);
  if (existing) {
    return NextResponse.json({ error: 'Profil već postoji', profile: existing }, { status: 409 });
  }

  const profile = await createPublisherProfile(user.id, type, user.name);
  if (!profile) {
    return NextResponse.json({ error: 'Greška pri kreiranju profila' }, { status: 500 });
  }

  return NextResponse.json({ profile }, { status: 201 });
}
