import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_BUCKETS = new Set(['avatars', 'pet-photos', 'pet-updates']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`upload:${user.id}:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Previše uploadova. Pokušajte kasnije.' }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedBucket = ((formData.get('bucket') as string) || 'pet-photos').trim();
    const requestedFolder = ((formData.get('folder') as string) || 'uploads').trim();

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Dozvoljene su samo JPG, PNG i WebP slike.' }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Datoteka je prevelika. Max 5MB.' }, { status: 400 });
    }
    if (!ALLOWED_BUCKETS.has(requestedBucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const safeFolder = sanitizeSegment(requestedFolder) || 'uploads';
    const bucket = requestedBucket;
    const folder = `users/${user.id}/${safeFolder}`;
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName: file.name,
      size: file.size,
      bucket,
      path,
    });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
