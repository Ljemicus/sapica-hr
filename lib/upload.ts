import { createClient } from '@/lib/supabase/client';

async function uploadViaAPI(file: File, bucket: string, folder: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  formData.append('folder', folder);

  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: `Upload failed (${res.status})` }));
      throw new Error(data.error || `Upload greška (${res.status})`);
    }
    return res.json();
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('Upload greška: mrežna greška');
  }
}

export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
}

/** Provjeri je li Supabase konfiguriran (client-side) */
function isSupabaseReady(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && url.length > 0 && !url.includes('placeholder') && key && key.length > 0 && !key.includes('placeholder'));
}

/**
 * Upload avatar u Supabase Storage bucket 'avatars'.
 * Fallback na mock kad nema Supabase.
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
  return uploadViaAPI(file, 'avatars', userId);
}

/**
 * Upload fotografije ljubimca u Supabase Storage bucket 'pet-photos'.
 * Fallback na mock kad nema Supabase.
 */
export async function uploadPetPhoto(petId: string, file: File): Promise<UploadResult> {
  return uploadViaAPI(file, 'pet-photos', petId);
}

/**
 * Dohvati javni URL za datoteku u bucketu.
 */
export function getPublicUrl(bucket: string, path: string): string {
  if (!isSupabaseReady()) return `https://petpark-storage.supabase.co/storage/v1/object/public/${bucket}/${path}`;
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Obriši datoteku iz bucketa.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  if (!isSupabaseReady()) return;
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Brisanje greška: ${error.message}`);
}

/**
 * Upload attachment za poruke (koristi 'pet-photos' bucket za slike u chatu).
 */
export async function uploadMessageAttachment(userId: string, file: File): Promise<UploadResult> {
  return uploadViaAPI(file, 'pet-photos', `messages/${userId}`);
}

/**
 * Mock upload — simulira Supabase Storage upload.
 * Generira fake URL i čeka 1-2 sekunde za realističnost.
 */
export async function mockUpload(
  file: File,
  bucket: string = 'uploads'
): Promise<UploadResult> {
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );

  const ext = file.name.split('.').pop() || 'jpg';
  const id = Math.random().toString(36).substring(2, 10);
  const fakePath = `${bucket}/${id}.${ext}`;
  const fakeUrl = `https://petpark-storage.supabase.co/storage/v1/object/public/${fakePath}`;

  return {
    url: fakeUrl,
    fileName: file.name,
    size: file.size,
  };
}

/**
 * Generira preview URL iz File objekta koristeći URL.createObjectURL.
 * Pozivatelj je odgovoran za revociranje URL-a kad više nije potreban.
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/** Validacija uploada */
export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const UPLOAD_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateFile(file: File): string | null {
  if (!UPLOAD_ACCEPTED_TYPES.includes(file.type)) {
    return 'Nepodržan format. Dozvoljeni su JPG, PNG i WebP.';
  }
  if (file.size > UPLOAD_MAX_SIZE) {
    return 'Datoteka je prevelika. Maksimalna veličina je 5MB.';
  }
  return null;
}
