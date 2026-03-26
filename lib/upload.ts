// Mock Supabase Storage upload — simulira upload bez pravog backenda

export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
}

/**
 * Simulira Supabase Storage upload.
 * Generira fake URL i čeka 1-2 sekunde za realističnost.
 */
export async function mockUpload(
  file: File,
  bucket: string = 'uploads'
): Promise<UploadResult> {
  // Simuliraj mrežnu latenciju (1-2s)
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
