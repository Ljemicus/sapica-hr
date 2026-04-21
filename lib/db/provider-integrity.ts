import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from './helpers';

export interface ProviderIntegrityIssue {
  providerId: string;
  providerKind: string;
  issue: string;
  details?: string;
}

interface ProviderRow {
  id: string;
  profile_id: string | null;
  provider_kind: string;
  public_status: string | null;
  display_name: string | null;
  city: string | null;
}

interface ProviderServiceRow {
  provider_id: string;
  service_code: string;
  is_active: boolean | null;
}

const ALLOWED_SERVICE_CODE_BY_KIND: Record<string, Set<string>> = {
  sitter: new Set(['boarding', 'walking', 'house_sitting', 'daycare', 'drop_in']),
  groomer: new Set(['grooming_haircut', 'grooming_bath', 'grooming_trimming', 'grooming_nails', 'grooming_brushing']),
  trainer: new Set(['training_basic', 'training_advanced', 'training_agility', 'training_behaviour', 'training_puppies']),
};

export async function getProviderIntegrityIssues(): Promise<ProviderIntegrityIssue[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  const issues: ProviderIntegrityIssue[] = [];

  const [{ data: providers }, { data: sitterSettings }, { data: groomerSettings }, { data: trainerSettings }, { data: services }] = await Promise.all([
    supabase.from('providers').select('id, profile_id, provider_kind, public_status, display_name, city').eq('public_status', 'listed'),
    supabase.from('provider_sitter_settings').select('provider_id'),
    supabase.from('provider_groomer_settings').select('provider_id'),
    supabase.from('provider_trainer_settings').select('provider_id'),
    supabase.from('provider_services').select('provider_id, service_code, is_active').eq('is_active', true),
  ]);

  const providerRows = (providers || []) as ProviderRow[];
  const sitterIds = new Set(((sitterSettings || []) as Array<{ provider_id: string }>).map((row) => row.provider_id));
  const groomerIds = new Set(((groomerSettings || []) as Array<{ provider_id: string }>).map((row) => row.provider_id));
  const trainerIds = new Set(((trainerSettings || []) as Array<{ provider_id: string }>).map((row) => row.provider_id));

  const servicesByProvider = new Map<string, ProviderServiceRow[]>();
  for (const row of ((services || []) as ProviderServiceRow[])) {
    const list = servicesByProvider.get(row.provider_id) || [];
    list.push(row);
    servicesByProvider.set(row.provider_id, list);
  }

  for (const provider of providerRows) {
    if (!provider.profile_id) {
      issues.push({ providerId: provider.id, providerKind: provider.provider_kind, issue: 'missing_profile_linkage' });
    }
    if (!provider.display_name) {
      issues.push({ providerId: provider.id, providerKind: provider.provider_kind, issue: 'missing_display_name' });
    }
    if (!provider.city) {
      issues.push({ providerId: provider.id, providerKind: provider.provider_kind, issue: 'missing_city' });
    }
    if (provider.provider_kind === 'other') {
      issues.push({ providerId: provider.id, providerKind: provider.provider_kind, issue: 'unsupported_provider_kind' });
    }

    if (provider.provider_kind === 'sitter' && !sitterIds.has(provider.id)) {
      issues.push({ providerId: provider.id, providerKind: provider.provider_kind, issue: 'missing_settings_row' });
    }
    if (provider.provider_kind === 'groomer' && !groomerIds.has(provider.id)) {
      issues.push({ providerId: provider.id, providerKind: provider.provider_kind, issue: 'missing_settings_row' });
    }
    if (provider.provider_kind === 'trainer' && !trainerIds.has(provider.id)) {
      issues.push({ providerId: provider.id, providerKind: provider.provider_kind, issue: 'missing_settings_row' });
    }

    const providerServices = servicesByProvider.get(provider.id) || [];
    if (providerServices.length === 0) {
      issues.push({ providerId: provider.id, providerKind: provider.provider_kind, issue: 'missing_active_services' });
      continue;
    }

    const allowed = ALLOWED_SERVICE_CODE_BY_KIND[provider.provider_kind];
    if (!allowed) continue;

    for (const service of providerServices) {
      if (!allowed.has(service.service_code)) {
        issues.push({
          providerId: provider.id,
          providerKind: provider.provider_kind,
          issue: 'unknown_or_mismatched_service_code',
          details: service.service_code,
        });
      }
    }
  }

  return issues;
}
