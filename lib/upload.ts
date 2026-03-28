import { createClient } from '@/lib/supabase/client';

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
  if (!isSupabaseReady()) return mockUpload(file, 'avatars');

  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) throw new Error(`Upload greška: ${error.message}`);

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);

  return { url: urlData.publicUrl, fileName: file.name, size: file.size };
}

/**
 * Upload fotografije ljubimca u Supabase Storage bucket 'pet-photos'.
 * Fallback na mock kad nema Supabase.
 */
export async function uploadPetPhoto(petId: string, file: File): Promise<UploadResult> {
  if (!isSupabaseReady()) return mockUpload(file, 'pet-photos');

  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${petId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('pet-photos').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) throw new Error(`Upload greška: ${error.message}`);

  const { data: urlData } = supabase.storage.from('pet-photos').getPublicUrl(path);

  return { url: urlData.publicUrl, fileName: file.name, size: file.size };
}

/**
 * Dohvati javni URL za datoteku u bucketu.
 */
export function getPublicUrl(bucket: string, path: string): string {
  if (!isSupabaseReady()) return `https://sapica-storage.supabase.co/storage/v1/object/public/${bucket}/${path}`;
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
  if (!isSupabaseReady()) return mockUpload(file, 'pet-photos');

  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `messages/${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('pet-photos').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) throw new Error(`Upload greška: ${error.message}`);

  const { data: urlData } = supabase.storage.from('pet-photos').getPublicUrl(path);

  return { url: urlData.publicUrl, fileName: file.name, size: file.size };
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
  const fakeUrl = `https://sapica-storage.supabase.co/storage/v1/object/public/${fakePath}`;

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
