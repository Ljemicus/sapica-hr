import { NextResponse } from 'next/server';
import { getTopic, incrementTopicView } from '@/lib/db/forum';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // fire-and-forget view increment
  incrementTopicView(id).catch(() => {});

  return NextResponse.json({ topic });
}
