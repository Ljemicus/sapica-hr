import { NextResponse } from 'next/server';
import { getTopics, createTopic } from '@/lib/db/forum';
import { getAuthUser } from '@/lib/auth';
import type { ForumCategorySlug } from '@/lib/types';

const gradients = [
  'from-orange-400 to-amber-300',
  'from-blue-400 to-cyan-300',
  'from-green-400 to-emerald-300',
  'from-purple-400 to-pink-300',
  'from-rose-400 to-orange-300',
  'from-teal-400 to-cyan-300',
];

function nameToGradient(name: string): string {
  return gradients[(name ?? '?').charCodeAt(0) % gradients.length];
}

function nameToInitial(name: string): string {
  return (name ?? '?').charAt(0).toUpperCase();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as ForumCategorySlug | null;

  const topics = await getTopics(category ?? undefined);
  return NextResponse.json({ topics });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { title?: string; category_slug?: string; body?: string; cover_image_url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, category_slug, body: content, cover_image_url } = body;

  if (!title?.trim() || !category_slug || !content?.trim()) {
    return NextResponse.json({ error: 'title, category_slug and body are required' }, { status: 400 });
  }

  const valid: ForumCategorySlug[] = ['pitanja', 'savjeti', 'price', 'izgubljeni', 'slobodna'];
  if (!valid.includes(category_slug as ForumCategorySlug)) {
    return NextResponse.json({ error: 'Invalid category_slug' }, { status: 400 });
  }

  const authorName = user.name || user.email?.split('@')[0] || 'Korisnik';

  const topic = await createTopic({
    user_id: user.id,
    category_slug: category_slug as ForumCategorySlug,
    title,
    body: content,
    author_name: authorName,
    author_initial: nameToInitial(authorName),
    author_gradient: nameToGradient(authorName),
    ...(typeof cover_image_url === 'string' && cover_image_url ? { cover_image_url } : {}),
  });

  if (!topic) {
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }

  return NextResponse.json({ topic }, { status: 201 });
}
