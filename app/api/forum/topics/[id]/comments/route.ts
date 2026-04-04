import { NextResponse } from 'next/server';
import { createComment, getPosts, getTopic } from '@/lib/db/forum';
import { getAuthUser } from '@/lib/auth';

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const authorName = user.name || user.email?.split('@')[0] || 'Korisnik';

  const topic = await getTopic(id);
  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }
  if ((topic as { status?: string }).status === 'locked') {
    return NextResponse.json({ error: 'Topic is locked' }, { status: 403 });
  }

  const comment = await createComment({
    topic_id: id,
    user_id: user.id,
    content: body.content,
    author_name: authorName,
    author_initial: nameToInitial(authorName),
    author_gradient: nameToGradient(authorName),
  });

  if (!comment) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }

  return NextResponse.json({ comment }, { status: 201 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = await getPosts(id);
  return NextResponse.json({ comments });
}
