import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { disabledServiceListingMessage, serviceListingWritesGuard } from './guards';
import type { ServiceListingDraftInput, ServiceListingMutationResult, ServiceListingUpdateInput } from './types';

type DraftCreated = { id: string; slug: string; status: 'draft'; moderationStatus: 'pending' };
type DraftChanged = { id: string; slug?: string | null; status: 'draft' | 'paused' | 'archived'; moderationStatus: 'pending' | 'rejected' };
type ProviderWriteRow = { id: string; city: string | null };
type ProviderServiceWriteRow = { id: string; provider_id: string; service_code: string | null; is_active: boolean | null };
type OwnedListingRow = { id: string; slug: string; provider_id: string; status: string | null; moderation_status: string | null };

type InsertDraftRow = {
  provider_id: string;
  provider_service_id: string | null;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  display_category: string | null;
  city: string | null;
  district: string | null;
  service_area: string | null;
  photos: unknown[];
  included_features: string[];
  house_rules: string[];
  availability_mode: 'request' | 'calendar' | 'instant';
  status: 'draft';
  moderation_status: 'pending';
  seo_title: string | null;
  seo_description: string | null;
  listed_at: null;
};

type InsertedDraftRow = { id: string; slug: string; status: string | null; moderation_status: string | null };
type CreateDraftDependencies = {
  env?: { PETPARK_ENABLE_SERVICE_LISTINGS_WRITES?: string };
  getCurrentUserId?: () => Promise<string | null>;
  findOwnedProvider?: (userId: string, providerId?: string) => Promise<ProviderWriteRow | null>;
  findOwnedProviderService?: (providerId: string, providerServiceId?: string, category?: string) => Promise<ProviderServiceWriteRow | null>;
  createUniqueSlug?: (base: string) => Promise<string>;
  insertDraft?: (row: InsertDraftRow) => Promise<InsertedDraftRow>;
};

type OwnerActionDependencies = {
  env?: { PETPARK_ENABLE_SERVICE_LISTINGS_WRITES?: string };
  getCurrentUserId?: () => Promise<string | null>;
  findOwnedListing?: (userId: string, listingId: string) => Promise<OwnedListingRow | null>;
  updateListing?: (listingId: string, patch: Record<string, unknown>) => Promise<OwnedListingRow>;
};

const categoryMap: Record<string, { category: string; displayCategory: string; serviceCodes: string[] }> = {
  cuvanje: { category: 'boarding', displayCategory: 'Čuvanje', serviceCodes: ['boarding', 'daycare', 'drop_in'] },
  boarding: { category: 'boarding', displayCategory: 'Čuvanje', serviceCodes: ['boarding'] },
  daycare: { category: 'daycare', displayCategory: 'Dnevno čuvanje', serviceCodes: ['daycare'] },
  setnja: { category: 'walking', displayCategory: 'Šetnja', serviceCodes: ['walking'] },
  walking: { category: 'walking', displayCategory: 'Šetnja', serviceCodes: ['walking'] },
  grooming: { category: 'grooming', displayCategory: 'Grooming', serviceCodes: ['grooming_basic', 'grooming'] },
  trening: { category: 'training', displayCategory: 'Trening', serviceCodes: ['training_basic', 'training'] },
  training: { category: 'training', displayCategory: 'Trening', serviceCodes: ['training_basic', 'training'] },
};

const draftSchema = z.object({
  providerId: z.string().uuid().optional(),
  providerServiceId: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(120),
  category: z.string().trim().max(60).optional(),
  shortDescription: z.string().trim().max(240).optional(),
  description: z.string().trim().max(2400).optional(),
  city: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
  serviceArea: z.string().trim().max(180).optional(),
  availabilityMode: z.enum(['request', 'calendar', 'instant']).optional(),
  includedFeatures: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
  houseRules: z.array(z.string().trim().min(1).max(120)).max(12).optional(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
});

const updateSchema = draftSchema.partial().extend({ id: z.string().uuid() });
const editableStatuses = new Set(['draft', 'paused']);

function disabledResult(): ServiceListingMutationResult {
  return { ok: false, reason: 'service_listings_writes_disabled', message: disabledServiceListingMessage('service_listings_writes_disabled') };
}

function failure(reason: 'service_listings_auth_required' | 'service_listings_provider_required' | 'service_listings_provider_service_required' | 'service_listings_validation_failed' | 'service_listings_write_failed', message: string): ServiceListingMutationResult {
  return { ok: false, reason, message };
}

function slugify(value: string) {
  const slug = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72);
  return slug || 'service-listing';
}

function normalizeCategory(input?: string | null) {
  const key = String(input || '').trim().toLowerCase();
  return categoryMap[key] || categoryMap.cuvanje;
}

async function defaultCurrentUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id || null;
}

async function defaultFindOwnedProvider(userId: string, providerId?: string): Promise<ProviderWriteRow | null> {
  const supabase = createAdminClient();
  let query = supabase.from('providers').select('id, city').eq('profile_id', userId).limit(1);
  if (providerId) query = query.eq('id', providerId);
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as ProviderWriteRow;
}

async function defaultFindOwnedProviderService(providerId: string, providerServiceId?: string, category?: string): Promise<ProviderServiceWriteRow | null> {
  const supabase = createAdminClient();
  const normalized = normalizeCategory(category);
  let query = supabase.from('provider_services').select('id, provider_id, service_code, is_active').eq('provider_id', providerId).eq('is_active', true).limit(1);
  if (providerServiceId) query = query.eq('id', providerServiceId);
  else if (normalized.serviceCodes.length > 0) query = query.in('service_code', normalized.serviceCodes);
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as ProviderServiceWriteRow;
}

async function defaultCreateUniqueSlug(base: string): Promise<string> {
  const supabase = createAdminClient();
  for (let index = 0; index < 10; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const { data, error } = await supabase.from('service_listings').select('slug').eq('slug', candidate).maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function defaultInsertDraft(row: InsertDraftRow): Promise<InsertedDraftRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('service_listings').insert(row).select('id, slug, status, moderation_status').single();
  if (error) throw error;
  return data as InsertedDraftRow;
}

async function defaultFindOwnedListing(userId: string, listingId: string): Promise<OwnedListingRow | null> {
  const supabase = createAdminClient();
  const { data: listing, error } = await supabase.from('service_listings').select('id, slug, provider_id, status, moderation_status').eq('id', listingId).maybeSingle();
  if (error || !listing) return null;
  const { data: provider, error: providerError } = await supabase.from('providers').select('id').eq('id', listing.provider_id).eq('profile_id', userId).maybeSingle();
  if (providerError || !provider) return null;
  return listing as OwnedListingRow;
}

async function defaultUpdateListing(listingId: string, patch: Record<string, unknown>): Promise<OwnedListingRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('service_listings').update(patch).eq('id', listingId).select('id, slug, provider_id, status, moderation_status').single();
  if (error) throw error;
  return data as OwnedListingRow;
}

export async function createDraftServiceListing(input: ServiceListingDraftInput, dependencies: CreateDraftDependencies = {}): Promise<ServiceListingMutationResult<DraftCreated>> {
  const guard = serviceListingWritesGuard(dependencies.env);
  if (!guard.enabled) return disabledResult();
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) return failure('service_listings_validation_failed', 'Provjeri obavezna polja prije spremanja nacrta.');

  const getCurrentUserId = dependencies.getCurrentUserId || defaultCurrentUserId;
  const findOwnedProvider = dependencies.findOwnedProvider || defaultFindOwnedProvider;
  const findOwnedProviderService = dependencies.findOwnedProviderService || defaultFindOwnedProviderService;
  const createUniqueSlug = dependencies.createUniqueSlug || defaultCreateUniqueSlug;
  const insertDraft = dependencies.insertDraft || defaultInsertDraft;
  const userId = await getCurrentUserId();
  if (!userId) return failure('service_listings_auth_required', 'Prijavi se prije spremanja nacrta usluge.');
  const provider = await findOwnedProvider(userId, parsed.data.providerId);
  if (!provider) return failure('service_listings_provider_required', 'Prvo dovrši profil pružatelja usluge.');
  const normalized = normalizeCategory(parsed.data.category);
  const providerService = await findOwnedProviderService(provider.id, parsed.data.providerServiceId, normalized.category);
  if (!providerService || providerService.provider_id !== provider.id || providerService.is_active !== true) return failure('service_listings_provider_service_required', 'Za nacrt je potrebna postojeća aktivna usluga pružatelja.');
  const city = parsed.data.city || provider.city || null;
  const slug = await createUniqueSlug(slugify([parsed.data.title, city, provider.id.slice(0, 8)].filter(Boolean).join(' ')));
  try {
    const inserted = await insertDraft({ provider_id: provider.id, provider_service_id: providerService.id, slug, title: parsed.data.title, short_description: parsed.data.shortDescription || null, description: parsed.data.description || null, category: normalized.category, display_category: normalized.displayCategory, city, district: parsed.data.district || null, service_area: parsed.data.serviceArea || city, photos: [], included_features: parsed.data.includedFeatures || [], house_rules: parsed.data.houseRules || [], availability_mode: parsed.data.availabilityMode || 'request', status: 'draft', moderation_status: 'pending', seo_title: parsed.data.seoTitle || null, seo_description: parsed.data.seoDescription || null, listed_at: null });
    return { ok: true, data: { id: inserted.id, slug: inserted.slug, status: 'draft', moderationStatus: 'pending' } };
  } catch {
    return failure('service_listings_write_failed', 'Nacrt trenutno nije moguće spremiti. Pokušaj ponovno kasnije.');
  }
}

export async function updateDraftServiceListing(input: ServiceListingUpdateInput, dependencies: OwnerActionDependencies = {}): Promise<ServiceListingMutationResult<DraftChanged>> {
  const guard = serviceListingWritesGuard(dependencies.env);
  if (!guard.enabled) return disabledResult();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return failure('service_listings_validation_failed', 'Provjeri polja prije uređivanja nacrta.');
  const userId = await (dependencies.getCurrentUserId || defaultCurrentUserId)();
  if (!userId) return failure('service_listings_auth_required', 'Prijavi se prije uređivanja nacrta.');
  const findOwnedListing = dependencies.findOwnedListing || defaultFindOwnedListing;
  const listing = await findOwnedListing(userId, parsed.data.id);
  if (!listing) return failure('service_listings_provider_required', 'Nacrt nije pronađen za ovog pružatelja.');
  if (!editableStatuses.has(String(listing.status))) return failure('service_listings_write_failed', 'Ovaj nacrt više nije moguće uređivati iz provider sučelja.');

  const patch: Record<string, unknown> = {};
  if (parsed.data.title) patch.title = parsed.data.title;
  if (parsed.data.shortDescription !== undefined) patch.short_description = parsed.data.shortDescription || null;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description || null;
  if (parsed.data.category !== undefined) {
    const normalized = normalizeCategory(parsed.data.category);
    patch.category = normalized.category;
    patch.display_category = normalized.displayCategory;
  }
  if (parsed.data.city !== undefined) patch.city = parsed.data.city || null;
  if (parsed.data.district !== undefined) patch.district = parsed.data.district || null;
  if (parsed.data.serviceArea !== undefined) patch.service_area = parsed.data.serviceArea || null;
  if (parsed.data.availabilityMode !== undefined) patch.availability_mode = parsed.data.availabilityMode;
  if (parsed.data.includedFeatures !== undefined) patch.included_features = parsed.data.includedFeatures;
  if (parsed.data.houseRules !== undefined) patch.house_rules = parsed.data.houseRules;
  if (parsed.data.seoTitle !== undefined) patch.seo_title = parsed.data.seoTitle || null;
  if (parsed.data.seoDescription !== undefined) patch.seo_description = parsed.data.seoDescription || null;
  patch.moderation_status = 'pending';
  patch.listed_at = null;

  try {
    const updated = await (dependencies.updateListing || defaultUpdateListing)(listing.id, patch);
    return { ok: true, data: { id: updated.id, slug: updated.slug, status: 'draft', moderationStatus: 'pending' } };
  } catch {
    return failure('service_listings_write_failed', 'Nacrt trenutno nije moguće urediti.');
  }
}

export async function publishServiceListing(_id: string): Promise<ServiceListingMutationResult> {
  const guard = serviceListingWritesGuard();
  if (!guard.enabled) return disabledResult();
  return failure('service_listings_write_failed', 'Objava javne usluge zahtijeva admin odobrenje.');
}

export async function pauseServiceListing(id: string, dependencies: OwnerActionDependencies = {}): Promise<ServiceListingMutationResult<DraftChanged>> {
  return setOwnerListingStatus(id, 'paused', dependencies);
}

export async function archiveServiceListing(id: string, dependencies: OwnerActionDependencies = {}): Promise<ServiceListingMutationResult<DraftChanged>> {
  return setOwnerListingStatus(id, 'archived', dependencies);
}

async function setOwnerListingStatus(id: string, status: 'paused' | 'archived', dependencies: OwnerActionDependencies = {}): Promise<ServiceListingMutationResult<DraftChanged>> {
  const guard = serviceListingWritesGuard(dependencies.env);
  if (!guard.enabled) return disabledResult();
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return failure('service_listings_validation_failed', 'Neispravan nacrt usluge.');
  const userId = await (dependencies.getCurrentUserId || defaultCurrentUserId)();
  if (!userId) return failure('service_listings_auth_required', 'Prijavi se prije promjene nacrta.');
  const listing = await (dependencies.findOwnedListing || defaultFindOwnedListing)(userId, parsed.data);
  if (!listing) return failure('service_listings_provider_required', 'Nacrt nije pronađen za ovog pružatelja.');
  if (listing.status === 'listed' && status === 'archived') return failure('service_listings_write_failed', 'Aktivne javne objave prvo mora pauzirati ili arhivirati admin.');
  try {
    const updated = await (dependencies.updateListing || defaultUpdateListing)(listing.id, { status, listed_at: null });
    return { ok: true, data: { id: updated.id, slug: updated.slug, status, moderationStatus: (updated.moderation_status === 'rejected' ? 'rejected' : 'pending') } };
  } catch {
    return failure('service_listings_write_failed', 'Status nacrta trenutno nije moguće promijeniti.');
  }
}
