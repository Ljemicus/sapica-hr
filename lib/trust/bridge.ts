import type { Groomer, Trainer } from '@/lib/types';
import { getVerification } from '@/lib/db/provider-verifications';
import { getProviderApplication } from '@/lib/db/provider-applications';
import { getProviderProfileCompleteness } from './completeness';

export interface TrustEligibilityResult {
  eligible: boolean;
  reason?: 'missing_user_id' | 'missing_provider_application' | 'not_public_status' | 'identity_not_approved' | 'profile_incomplete';
  providerApplicationId?: string;
  missingFields?: string[];
}

export async function getProviderApplicationByUserId(userId: string) {
  return getProviderApplication(userId);
}

export async function getTrustEligibilityByUserId(userId?: string | null): Promise<TrustEligibilityResult> {
  if (!userId) {
    return { eligible: false, reason: 'missing_user_id' };
  }

  const providerApplication = await getProviderApplicationByUserId(userId);
  if (!providerApplication) {
    return { eligible: false, reason: 'missing_provider_application' };
  }

  if (providerApplication.public_status !== 'public') {
    return {
      eligible: false,
      reason: 'not_public_status',
      providerApplicationId: providerApplication.id,
    };
  }

  const identityVerification = await getVerification(providerApplication.id, 'identity');
  if (!identityVerification || identityVerification.status !== 'approved') {
    return {
      eligible: false,
      reason: 'identity_not_approved',
      providerApplicationId: providerApplication.id,
    };
  }

  const completeness = await getProviderProfileCompleteness(providerApplication.id);
  if (!completeness.isComplete) {
    return {
      eligible: false,
      reason: 'profile_incomplete',
      providerApplicationId: providerApplication.id,
      missingFields: completeness.missingFields,
    };
  }

  return {
    eligible: true,
    providerApplicationId: providerApplication.id,
  };
}

export async function getTrustEligibilityForGroomer(groomer: Groomer): Promise<TrustEligibilityResult> {
  if (!groomer.user_id) {
    const hasPublicDirectoryData = Boolean(groomer.name?.trim() && groomer.city?.trim() && groomer.bio?.trim());
    return { eligible: hasPublicDirectoryData };
  }

  return getTrustEligibilityByUserId(groomer.user_id);
}

export async function getTrustEligibilityForTrainer(trainer: Trainer): Promise<TrustEligibilityResult> {
  if (!trainer.user_id) {
    const hasPublicDirectoryData = Boolean(trainer.name?.trim() && trainer.city?.trim() && trainer.bio?.trim());
    return { eligible: hasPublicDirectoryData };
  }

  return getTrustEligibilityByUserId(trainer.user_id);
}
