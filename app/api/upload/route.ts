import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { appLogger } from '@/lib/logger';
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
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`upload:${user.id}:${ip}`, 10, 60_000)) {
      return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše uploadova. Pokušajte kasnije.' });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedBucket = ((formData.get('bucket') as string) || 'pet-photos').trim();
    const requestedFolder = ((formData.get('folder') as string) || 'uploads').trim();

    if (!file) {
      appLogger.warn('upload.image', 'Upload rejected because file is missing');
      return apiError({ status: 400, code: 'FILE_MISSING', message: 'No file provided' });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return apiError({ status: 400, code: 'INVALID_FILE_TYPE', message: 'Dozvoljene su samo JPG, PNG i WebP slike.' });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return apiError({ status: 400, code: 'FILE_TOO_LARGE', message: 'Datoteka je prevelika. Max 5MB.' });
    }
    if (!ALLOWED_BUCKETS.has(requestedBucket)) {
      return apiError({ status: 400, code: 'INVALID_BUCKET', message: 'Invalid bucket' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return apiError({ status: 500, code: 'STORAGE_UNAVAILABLE', message: 'Storage not configured' });
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
      appLogger.error('upload.image', 'Storage upload failed', {
        userId: user.id,
        bucket,
        path,
        reason: error.message,
      });
      return apiError({ status: 500, code: 'UPLOAD_FAILED', message: error.message });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName: file.name,
      size: file.size,
      bucket,
      path,
    });
  } catch (error) {
    appLogger.error('upload.image', 'Upload failed unexpectedly', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return apiError({ status: 500, code: 'UPLOAD_FAILED', message: 'Upload failed' });
  }
}
