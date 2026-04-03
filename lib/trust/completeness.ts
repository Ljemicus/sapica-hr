import { getProviderApplicationById } from '@/lib/db/provider-applications';

export interface ProviderCompletenessResult {
  isComplete: boolean;
  missingFields: string[];
  completenessPct: number;
}

export async function getProviderProfileCompleteness(
  providerApplicationId: string
): Promise<ProviderCompletenessResult> {
  const application = await getProviderApplicationById(providerApplicationId);

  if (!application) {
    return {
      isComplete: false,
      missingFields: ['provider_application'],
      completenessPct: 0,
    };
  }

  const missingFields: string[] = [];

  if (!application.display_name?.trim()) missingFields.push('display_name');
  if (!application.bio?.trim() || application.bio.trim().length < 100) missingFields.push('bio');
  if (!application.city?.trim()) missingFields.push('city');
  if (!application.working_hours) missingFields.push('working_hours');

  const services = Array.isArray(application.services) ? application.services : [];
  if (services.length === 0) missingFields.push('services');

  const prices = application.prices && typeof application.prices === 'object'
    ? (application.prices as Record<string, unknown>)
    : {};
  const hasAnyPrice = Object.values(prices).some((value) => {
    if (typeof value === 'number') return value > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    if (value && typeof value === 'object') {
      const v = value as Record<string, unknown>;
      return Object.values(v).some((inner) => {
        if (typeof inner === 'number') return inner > 0;
        if (typeof inner === 'string') return inner.trim().length > 0;
        return false;
      });
    }
    return false;
  });
  if (!hasAnyPrice) missingFields.push('prices');

  const totalChecks = 6;
  const passedChecks = totalChecks - missingFields.length;
  const completenessPct = Math.max(0, Math.round((passedChecks / totalChecks) * 100));

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completenessPct,
  };
}

export async function canProviderBePublic(providerApplicationId: string): Promise<boolean> {
  const result = await getProviderProfileCompleteness(providerApplicationId);
  return result.isComplete;
}
