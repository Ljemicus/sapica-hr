import type { AppealStatus, RescueAppeal, RescueOrganization, RescueVerificationDocument } from '@/lib/types';

export function slugifyRescueValue(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function getRescueOrganizationCompletion(organization: Partial<RescueOrganization> | null | undefined) {
  const required = [
    Boolean(organization?.legal_name?.trim()),
    Boolean(organization?.display_name?.trim()),
    Boolean(organization?.slug?.trim()),
    Boolean(organization?.description?.trim()),
    Boolean(organization?.city?.trim()),
    Boolean(organization?.email?.trim()),
    Boolean(organization?.phone?.trim()),
  ];

  const completed = required.filter(Boolean).length;
  const total = required.length;

  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
    isReadyForReview: completed === total,
  };
}

export function hasApprovedExternalDonationLink(organization: Partial<RescueOrganization> | null | undefined) {
  return Boolean(
    organization?.external_donation_url?.trim()
      && organization.external_donation_url_status === 'approved'
      && organization.verification_status === 'approved'
      && organization.status === 'active'
  );
}

export function getRescueVerificationReadiness(
  organization: Partial<RescueOrganization> | null | undefined,
  documents: RescueVerificationDocument[]
) {
  const blockers: string[] = [];
  const completion = getRescueOrganizationCompletion(organization);

  if (!completion.isReadyForReview) blockers.push('Osnovni profil organizacije nije kompletan.');
  if (!organization?.external_donation_url?.trim()) blockers.push('Dodaj vanjski donation link organizacije.');
  if (!documents.length) blockers.push('Dodaj barem jedan dokument za verifikaciju.');

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function getAppealPublishReadiness(organization: RescueOrganization | null, appeal: Partial<RescueAppeal> | null | undefined) {
  const blockers: string[] = [];

  if (!organization) blockers.push('Organizacija nije pronađena.');
  if (organization && organization.status !== 'active') {
    blockers.push('Organizacija mora biti aktivirana prije objave javne apelacije.');
  }
  if (organization && !hasApprovedExternalDonationLink(organization)) {
    blockers.push('Potrebna je odobrena vanjska donation poveznica prije javne objave apelacije.');
  }

  if (!appeal?.title?.trim()) blockers.push('Naslov apelacije je obavezan.');
  if (!appeal?.slug?.trim()) blockers.push('Slug apelacije je obavezan.');
  if (!appeal?.summary?.trim()) blockers.push('Sažetak apelacije je obavezan.');
  if (!appeal?.story?.trim()) blockers.push('Priča / opis apelacije je obavezan.');
  if (!appeal?.beneficiary_name?.trim()) blockers.push('Potreban je naziv životinje ili korisnika pomoći.');
  if (!appeal?.target_amount_cents || appeal.target_amount_cents <= 0) blockers.push('Ciljani iznos mora biti veći od nule.');

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function getAppealPrimaryStatusLabel(status: AppealStatus) {
  switch (status) {
    case 'draft':
      return 'Skica';
    case 'active':
      return 'Objavljena';
    case 'funded':
      return 'Financirana';
    case 'closed':
      return 'Zatvorena';
    case 'cancelled':
      return 'Otkazana';
    default:
      return status;
  }
}
