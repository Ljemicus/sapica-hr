/**
 * Provjeri je li Supabase konfiguriran (postoje li env varijable).
 * Ako nije → koristimo mock podatke kao fallback.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && url.length > 0 && !url.includes('placeholder') && key && key.length > 0 && !key.includes('placeholder'));
}
