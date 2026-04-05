import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type {
  RescueDonationLinkStatus,
  RescueOrganization,
  RescueOrganizationStatus,
  RescueReviewState,
  RescueVerificationStatus,
} from '@/lib/types';

interface CreateRescueOrganizationInput {
  owner_user_id: string;
  legal_name: string;
  display_name: string;
  slug: string;
  kind?: RescueOrganization['kind'];
  publisher_profile_id?: string | null;
  description?: string | null;
  city?: string | null;
  country_code?: string;
  email?: string | null;
  phone?: string | null;
  website_url?: string | null;
  external_donation_url?: string | null;
  donation_contact_name?: string | null;
  bank_account_iban?: string | null;
}

export async function getRescueOrganization(id: string): Promise<RescueOrganization | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_organizations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data as RescueOrganization;
  } catch {
    return null;
  }
}

export async function getRescueOrganizationByOwner(userId: string): Promise<RescueOrganization | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_organizations')
      .select('*')
      .eq('owner_user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as RescueOrganization;
  } catch {
    return null;
  }
}

export async function getRescueOrganizationBySlug(slug: string): Promise<RescueOrganization | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_organizations')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    return data as RescueOrganization;
  } catch {
    return null;
  }
}

export async function getRescueOrganizations(status?: RescueOrganizationStatus): Promise<RescueOrganization[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from('rescue_organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as RescueOrganization[];
  } catch {
    return [];
  }
}

export async function createRescueOrganization(
  input: CreateRescueOrganizationInput
): Promise<RescueOrganization | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const payload = {
      owner_user_id: input.owner_user_id,
      publisher_profile_id: input.publisher_profile_id ?? null,
      status: 'draft' as RescueOrganizationStatus,
      verification_status: 'not_submitted' as RescueVerificationStatus,
      review_state: 'not_started' as RescueReviewState,
      kind: input.kind ?? 'rescue',
      legal_name: input.legal_name,
      display_name: input.display_name,
      slug: input.slug,
      description: input.description ?? null,
      city: input.city ?? null,
      country_code: input.country_code ?? 'HR',
      email: input.email ?? null,
      phone: input.phone ?? null,
      website_url: input.website_url ?? null,
      external_donation_url: input.external_donation_url ?? null,
      external_donation_url_status: input.external_donation_url ? 'pending_review' : 'not_provided',
      donation_contact_name: input.donation_contact_name ?? null,
      bank_account_iban: input.bank_account_iban ?? null,
    };

    const { data, error } = await supabase
      .from('rescue_organizations')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueOrganization;
  } catch {
    return null;
  }
}

export async function updateRescueOrganization(
  id: string,
  updates: Partial<Omit<RescueOrganization, 'id' | 'owner_user_id' | 'created_at' | 'updated_at'>>
): Promise<RescueOrganization | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_organizations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueOrganization;
  } catch {
    return null;
  }
}

interface ReviewRescueOrganizationInput {
  organizationId: string;
  adminId: string;
  reviewState?: RescueReviewState;
  status?: RescueOrganizationStatus;
  verificationStatus?: RescueVerificationStatus;
  externalDonationUrlStatus?: RescueDonationLinkStatus;
  adminNotes?: string | null;
}

export async function getRescueOrganizationsByCity(city: string): Promise<RescueOrganization[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_organizations')
      .select('*')
      .eq('status', 'active')
      .eq('city', city)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as RescueOrganization[];
  } catch {
    return [];
  }
}

export async function getVerifiedRescueOrganizations(): Promise<RescueOrganization[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_organizations')
      .select('*')
      .eq('status', 'active')
      .eq('verification_status', 'approved')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as RescueOrganization[];
  } catch {
    return [];
  }
}

export async function getPendingRescueOrganizations(): Promise<RescueOrganization[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_organizations')
      .select('*')
      .or('status.eq.pending_review,review_state.eq.pending,review_state.eq.in_review,verification_status.eq.pending,external_donation_url_status.eq.pending_review')
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data as RescueOrganization[];
  } catch {
    return [];
  }
}

export interface RescueStats {
  totalOrganizations: number;
  activeOrganizations: number;
  pendingOrganizations: number;
  totalAppeals: number;
  activeAppeals: number;
  pendingVerifications: number;
  pendingDonationLinks: number;
}

export async function getRescueStats(): Promise<RescueStats> {
  if (!isSupabaseConfigured()) {
    return {
      totalOrganizations: 0,
      activeOrganizations: 0,
      pendingOrganizations: 0,
      totalAppeals: 0,
      activeAppeals: 0,
      pendingVerifications: 0,
      pendingDonationLinks: 0,
    };
  }

  try {
    const supabase = await createClient();

    // Get organization counts
    const { data: orgs, error: orgsError } = await supabase
      .from('rescue_organizations')
      .select('status,verification_status,external_donation_url_status');

    if (orgsError || !orgs) {
      throw orgsError;
    }

    // Get appeal counts
    const { data: appeals, error: appealsError } = await supabase
      .from('rescue_appeals')
      .select('status');

    if (appealsError || !appeals) {
      throw appealsError;
    }

    const totalOrganizations = orgs.length;
    const activeOrganizations = orgs.filter(o => o.status === 'active').length;
    const pendingOrganizations = orgs.filter(o => 
      o.status === 'pending_review' || 
      o.verification_status === 'pending' ||
      o.external_donation_url_status === 'pending_review'
    ).length;
    const pendingVerifications = orgs.filter(o => o.verification_status === 'pending').length;
    const pendingDonationLinks = orgs.filter(o => o.external_donation_url_status === 'pending_review').length;

    const totalAppeals = appeals.length;
    const activeAppeals = appeals.filter(a => a.status === 'active').length;

    return {
      totalOrganizations,
      activeOrganizations,
      pendingOrganizations,
      totalAppeals,
      activeAppeals,
      pendingVerifications,
      pendingDonationLinks,
    };
  } catch {
    return {
      totalOrganizations: 0,
      activeOrganizations: 0,
      pendingOrganizations: 0,
      totalAppeals: 0,
      activeAppeals: 0,
      pendingVerifications: 0,
      pendingDonationLinks: 0,
    };
  }
}

export async function reviewRescueOrganization(
  input: ReviewRescueOrganizationInput
): Promise<RescueOrganization | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const now = new Date().toISOString();
    const patch: Partial<RescueOrganization> & { updated_at: string } = {
      updated_at: now,
      reviewed_at: now,
      reviewed_by: input.adminId,
    };

    if (typeof input.reviewState !== 'undefined') patch.review_state = input.reviewState;
    if (typeof input.status !== 'undefined') patch.status = input.status;
    if (typeof input.verificationStatus !== 'undefined') {
      patch.verification_status = input.verificationStatus;
      patch.verified_at = input.verificationStatus === 'approved' ? now : null;
      patch.verified_by = input.verificationStatus === 'approved' ? input.adminId : null;
    }
    if (typeof input.externalDonationUrlStatus !== 'undefined') {
      patch.external_donation_url_status = input.externalDonationUrlStatus;
      patch.external_donation_url_verified_at = input.externalDonationUrlStatus === 'approved' ? now : null;
      patch.external_donation_url_verified_by = input.externalDonationUrlStatus === 'approved' ? input.adminId : null;
    }
    if (typeof input.adminNotes !== 'undefined') patch.admin_notes = input.adminNotes;

    const { data, error } = await supabase
      .from('rescue_organizations')
      .update(patch)
      .eq('id', input.organizationId)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueOrganization;
  } catch {
    return null;
  }
}
