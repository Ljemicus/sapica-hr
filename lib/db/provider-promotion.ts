import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { ProviderApplication } from '@/lib/types';

export type CanonicalProviderKind = 'sitter' | 'groomer' | 'trainer' | 'other';

export interface PromotionResult {
  ok: boolean;
  providerId?: string;
  providerKind?: CanonicalProviderKind;
  warnings: string[];
  errors: string[];
}

interface NormalizedProviderApplication {
  providerKind: CanonicalProviderKind;
  displayName: string | null;
  bio: string | null;
  city: string | null;
  phone: string | null;
  address: string | null;
  experienceYears: number;
  serviceCodes: string[];
}

const PROVIDER_TYPE_MAP: Record<string, CanonicalProviderKind> = {
  'čuvar': 'sitter',
  cuvar: 'sitter',
  sitter: 'sitter',
  groomer: 'groomer',
  trener: 'trainer',
  trainer: 'trainer',
  drugo: 'other',
  other: 'other',
};

const SERVICE_LABEL_MAP: Record<string, string[]> = {
  'čuvanje preko noći': ['boarding'],
  'cuvanje preko noci': ['boarding'],
  'dnevni boravak': ['daycare'],
  'šetnja pasa': ['walking'],
  'setnja pasa': ['walking'],
  'čuvanje u domu vlasnika': ['house_sitting'],
  'cuvanje u domu vlasnika': ['house_sitting'],
  'njega i kupanje': ['grooming_bath'],
  'trening i dresura': ['training_basic'],
};

function normalizeProviderType(value: string | null | undefined): CanonicalProviderKind {
  return PROVIDER_TYPE_MAP[String(value || '').toLowerCase()] || 'other';
}

function normalizeServiceLabels(values: string[] | null | undefined): { codes: string[]; warnings: string[] } {
  const warnings: string[] = [];
  const codes = new Set<string>();

  for (const raw of values || []) {
    const mapped = SERVICE_LABEL_MAP[String(raw).toLowerCase()];
    if (!mapped) {
      warnings.push(`Unknown service label: ${raw}`);
      continue;
    }
    for (const code of mapped) codes.add(code);
  }

  return { codes: Array.from(codes), warnings };
}

export function normalizeProviderApplication(application: ProviderApplication): { normalized: NormalizedProviderApplication; warnings: string[] } {
  const providerKind = normalizeProviderType(application.provider_type);
  const serviceNormalization = normalizeServiceLabels(application.services || []);

  const warnings = [...serviceNormalization.warnings];
  if (providerKind === 'other') {
    warnings.push(`Provider type is not yet canonical: ${application.provider_type || 'unknown'}`);
  }
  if (!application.display_name) warnings.push('Missing display_name');
  if (!application.city) warnings.push('Missing city');

  return {
    normalized: {
      providerKind,
      displayName: application.display_name || null,
      bio: application.bio || null,
      city: application.city || null,
      phone: application.phone || null,
      address: application.address || null,
      experienceYears: Number(application.experience_years || 0),
      serviceCodes: serviceNormalization.codes,
    },
    warnings,
  };
}

export async function syncProviderApplicationToLiveModel(application: ProviderApplication): Promise<PromotionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, warnings: [], errors: ['Supabase is not configured'] };
  }

  const supabase = await createClient();
  const { normalized, warnings } = normalizeProviderApplication(application);
  const errors: string[] = [];

  if (!application.user_id) {
    return { ok: false, providerKind: normalized.providerKind, warnings, errors: ['Application is missing user_id'] };
  }

  const providerPayload = {
    profile_id: application.user_id,
    provider_kind: normalized.providerKind,
    display_name: normalized.displayName,
    bio: normalized.bio,
    city: normalized.city,
    address: normalized.address,
    phone: normalized.phone,
    experience_years: normalized.experienceYears,
  };

  const { data: existingProvider } = await supabase
    .from('providers')
    .select('id, public_status')
    .eq('profile_id', application.user_id)
    .eq('provider_kind', normalized.providerKind)
    .maybeSingle();

  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .upsert(existingProvider ? { ...providerPayload, id: existingProvider.id } : providerPayload, { onConflict: 'id' })
    .select('id, public_status')
    .single();

  if (providerError || !provider) {
    return {
      ok: false,
      providerKind: normalized.providerKind,
      warnings,
      errors: [`Provider upsert failed: ${providerError?.message || 'unknown error'}`],
    };
  }

  const providerId = provider.id as string;

  if (normalized.providerKind === 'sitter') {
    const { error } = await supabase
      .from('provider_sitter_settings')
      .upsert({ provider_id: providerId, services: application.services || [] }, { onConflict: 'provider_id' });
    if (error) errors.push(`provider_sitter_settings upsert failed: ${error.message}`);
  }

  if (normalized.providerKind === 'groomer') {
    const { error } = await supabase
      .from('provider_groomer_settings')
      .upsert({ provider_id: providerId }, { onConflict: 'provider_id' });
    if (error) errors.push(`provider_groomer_settings upsert failed: ${error.message}`);
  }

  if (normalized.providerKind === 'trainer') {
    const { error } = await supabase
      .from('provider_trainer_settings')
      .upsert({ provider_id: providerId }, { onConflict: 'provider_id' });
    if (error) errors.push(`provider_trainer_settings upsert failed: ${error.message}`);
  }

  const { error: deleteServicesError } = await supabase.from('provider_services').delete().eq('provider_id', providerId);
  if (deleteServicesError) {
    errors.push(`provider_services cleanup failed: ${deleteServicesError.message}`);
  } else if (normalized.serviceCodes.length > 0) {
    const rows = normalized.serviceCodes.map((serviceCode) => ({ provider_id: providerId, service_code: serviceCode, is_active: true }));
    const { error: servicesError } = await supabase.from('provider_services').insert(rows);
    if (servicesError) errors.push(`provider_services insert failed: ${servicesError.message}`);
  }

  return {
    ok: errors.length === 0,
    providerId,
    providerKind: normalized.providerKind,
    warnings,
    errors,
  };
}

export async function promoteProviderApplication(applicationId: string): Promise<PromotionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, warnings: [], errors: ['Supabase is not configured'] };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('provider_applications')
    .select('*')
    .eq('id', applicationId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, warnings: [], errors: [`Could not load application: ${error?.message || 'not found'}`] };
  }

  return syncProviderApplicationToLiveModel(data as ProviderApplication);
}
