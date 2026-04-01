import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPublisherProfile, updatePublisherProfile } from '@/lib/db/publisher-profiles';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });
  }

  const profile = await getPublisherProfile(user.id);
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.display_name === 'string' && body.display_name.trim()) {
    updates.display_name = body.display_name.trim();
  }
  if (body.bio !== undefined) updates.bio = body.bio;
  if (body.city !== undefined) updates.city = body.city;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

  const profile = await updatePublisherProfile(user.id, updates);
  if (!profile) {
    return NextResponse.json({ error: 'Profil nije pronađen' }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
