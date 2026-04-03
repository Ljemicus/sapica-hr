import { getVerification } from '@/lib/db/provider-verifications';
import { getProviderApplicationById } from '@/lib/db/provider-applications';
import { getProviderProfileCompleteness } from './completeness';

export interface ProviderPublicGateResult {
  allowed: boolean;
  reason?: 'missing_application' | 'identity_not_approved' | 'profile_incomplete' | 'not_public_status';
  missingFields?: string[];
}

export async function getProviderPublicGate(
  providerApplicationId: string
): Promise<ProviderPublicGateResult> {
  const application = await getProviderApplicationById(providerApplicationId);
  if (!application) {
    return { allowed: false, reason: 'missing_application' };
  }

  if (application.public_status !== 'public') {
    return { allowed: false, reason: 'not_public_status' };
  }

  const identityVerification = await getVerification(providerApplicationId, 'identity');
  if (!identityVerification || identityVerification.status !== 'approved') {
    return { allowed: false, reason: 'identity_not_approved' };
  }

  const completeness = await getProviderProfileCompleteness(providerApplicationId);
  if (!completeness.isComplete) {
    return {
      allowed: false,
      reason: 'profile_incomplete',
      missingFields: completeness.missingFields,
    };
  }

  return { allowed: true };
}

export async function assertProviderPublic(providerApplicationId: string): Promise<boolean> {
  const result = await getProviderPublicGate(providerApplicationId);
  return result.allowed;
}
