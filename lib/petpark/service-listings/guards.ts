import type { ServiceListingGuardResult } from './types';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'enabled']);

function envFlagEnabled(value: string | undefined) {
  return TRUE_VALUES.has(String(value || '').trim().toLowerCase());
}

export function serviceListingReadsGuard(env: { PETPARK_ENABLE_SERVICE_LISTINGS_READS?: string } = process.env as { PETPARK_ENABLE_SERVICE_LISTINGS_READS?: string }): ServiceListingGuardResult {
  if (!envFlagEnabled(env.PETPARK_ENABLE_SERVICE_LISTINGS_READS)) {
    return { enabled: false, reason: 'service_listings_reads_disabled' };
  }
  return { enabled: true };
}

export function serviceListingWritesGuard(env: { PETPARK_ENABLE_SERVICE_LISTINGS_WRITES?: string } = process.env as { PETPARK_ENABLE_SERVICE_LISTINGS_WRITES?: string }): ServiceListingGuardResult {
  if (!envFlagEnabled(env.PETPARK_ENABLE_SERVICE_LISTINGS_WRITES)) {
    return { enabled: false, reason: 'service_listings_writes_disabled' };
  }
  return { enabled: true };
}

export function isServiceListingsUnavailableError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const maybe = error as { code?: unknown; message?: unknown; details?: unknown };
  const code = typeof maybe.code === 'string' ? maybe.code : '';
  const text = [maybe.message, maybe.details].filter((value): value is string => typeof value === 'string').join(' ').toLowerCase();

  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    text.includes('service_listings') && (text.includes('schema cache') || text.includes('does not exist') || text.includes('relation'))
  );
}

export function disabledServiceListingMessage(reason: 'service_listings_reads_disabled' | 'service_listings_writes_disabled' | 'service_listings_table_unavailable') {
  if (reason === 'service_listings_writes_disabled') return 'Spremanje nacrta trenutno nije omogućeno. Ništa nije objavljeno.';
  if (reason === 'service_listings_table_unavailable') return 'Service listings tablica još nije dostupna; prikazuje se postojeća ponuda.';
  return 'Service listings čitanje još nije omogućeno; prikazuje se postojeća ponuda.';
}
