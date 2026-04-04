import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { dispatchAlert } from '@/lib/alerting';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { rateLimit } from '@/lib/rate-limit';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VERIFICATION_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const ALLOWED_BUCKETS = new Set(['avatars', 'pet-photos', 'pet-updates', 'verification-docs']);
const PRIVATE_BUCKETS = new Set(['verification-docs']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
}

export async function POST(request: NextRequest) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('upload.image', reqId);
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`upload:${user.id}:${ip}`, 10, 60_000)) {
      log.warn( 'Rate limit hit', { userId: user.id, ip }, 'P3');
      return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše uploadova. Pokušajte kasnije.' });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedBucket = ((formData.get('bucket') as string) || 'pet-photos').trim();
    const requestedFolder = ((formData.get('folder') as string) || 'uploads').trim();

    if (!file) {
      log.warn( 'Upload rejected because file is missing');
      return apiError({ status: 400, code: 'FILE_MISSING', message: 'No file provided' });
    }
    const isPrivateBucket = PRIVATE_BUCKETS.has(requestedBucket);
    const allowedTypes = isPrivateBucket ? VERIFICATION_TYPES : ALLOWED_TYPES;
    if (!allowedTypes.has(file.type)) {
      return apiError({ status: 400, code: 'INVALID_FILE_TYPE', message: isPrivateBucket ? 'Dozvoljeni su samo JPG, PNG, WebP i PDF dokumenti.' : 'Dozvoljene su samo JPG, PNG i WebP slike.' });
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
      log.error( 'Storage not configured — missing env vars');
      dispatchAlert({
        severity: 'P1',
        service: 'upload.image',
        description: 'Storage not configured — Supabase env vars missing',
        owner: 'platform',
      });
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
      log.error( 'Storage upload failed', {
        userId: user.id,
        bucket,
        path,
        reason: error.message,
      });
      dispatchAlert({
        severity: 'P2',
        service: 'upload.image',
        description: 'Storage upload failed',
        value: `bucket=${bucket}, error=${error.message}`,
        owner: 'platform',
      });
      return apiError({ status: 500, code: 'UPLOAD_FAILED', message: error.message });
    }

    log.info( 'Upload succeeded', {
      userId: user.id,
      bucket,
      path,
      fileSize: file.size,
      fileType: file.type,
    });

    if (isPrivateBucket) {
      return NextResponse.json({
        url: null,
        fileName: file.name,
        size: file.size,
        bucket,
        path,
      });
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
    log.error( 'Upload failed unexpectedly', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    dispatchAlert({
      severity: 'P1',
      service: 'upload.image',
      description: 'Unhandled upload failure',
      value: error instanceof Error ? error.message : 'unknown',
      owner: 'platform',
    });
    return apiError({ status: 500, code: 'UPLOAD_FAILED', message: 'Upload failed' });
  }
}
