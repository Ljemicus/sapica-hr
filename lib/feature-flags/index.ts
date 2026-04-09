// Feature flags configuration for PetPark
// Use these to enable/disable features dynamically

export type FeatureFlag =
  | 'forum'
  | 'shop'
  | 'challenges'
  | 'photoContests'
  | 'aiMatching'
  | 'adoption'
  | 'lostPets'
  | 'petDiary'
  | 'socialFeed'
  | 'gamification'
  | 'breeders'
  | 'dogFriendly'
  | 'emergencyVets';

interface FeatureConfig {
  enabled: boolean;
  description: string;
  showInNav: boolean;
  redirectTo?: string;
}

// Production feature flags - core marketplace only
const productionFlags: Record<FeatureFlag, FeatureConfig> = {
  // CORE FEATURES - Always enabled
  emergencyVets: { enabled: true, description: 'Emergency vet locator', showInNav: true },
  
  // MARKETPLACE CORE - Enabled for launch
  aiMatching: { enabled: true, description: 'AI-powered sitter matching', showInNav: true },
  
  // SECONDARY FEATURES - Disabled for initial launch
  forum: { enabled: false, description: 'Community forum', showInNav: false, redirectTo: '/zajednica' },
  shop: { enabled: false, description: 'Pet shop/e-commerce', showInNav: false, redirectTo: '/' },
  challenges: { enabled: false, description: 'Community challenges', showInNav: false },
  photoContests: { enabled: false, description: 'Photo contests', showInNav: false },
  adoption: { enabled: false, description: 'Pet adoption listings', showInNav: false },
  lostPets: { enabled: false, description: 'Lost and found pets', showInNav: false },
  petDiary: { enabled: false, description: 'Pet journal and milestones', showInNav: false },
  socialFeed: { enabled: false, description: 'Social feed and posts', showInNav: false },
  gamification: { enabled: false, description: 'Badges and points', showInNav: false },
  breeders: { enabled: false, description: 'Breeder directory', showInNav: false },
  dogFriendly: { enabled: false, description: 'Dog-friendly places', showInNav: false },
};

// Development feature flags - all enabled for testing
const developmentFlags: Record<FeatureFlag, FeatureConfig> = {
  ...productionFlags,
  forum: { enabled: true, description: 'Community forum', showInNav: true },
  shop: { enabled: true, description: 'Pet shop/e-commerce', showInNav: true },
  challenges: { enabled: true, description: 'Community challenges', showInNav: true },
  photoContests: { enabled: true, description: 'Photo contests', showInNav: true },
  adoption: { enabled: true, description: 'Pet adoption listings', showInNav: true },
  lostPets: { enabled: true, description: 'Lost and found pets', showInNav: true },
  petDiary: { enabled: true, description: 'Pet journal and milestones', showInNav: false },
  socialFeed: { enabled: true, description: 'Social feed and posts', showInNav: true },
  gamification: { enabled: true, description: 'Badges and points', showInNav: false },
  breeders: { enabled: true, description: 'Breeder directory', showInNav: true },
  dogFriendly: { enabled: true, description: 'Dog-friendly places', showInNav: true },
};

// Get current environment flags
function getFlags(): Record<FeatureFlag, FeatureConfig> {
  // Check for explicit override in localStorage (client-side only)
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('featureFlags');
    if (override) {
      try {
        return { ...productionFlags, ...JSON.parse(override) };
      } catch {
        // Invalid JSON, fall through
      }
    }
  }
  
  // Use development flags in non-production environments
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ALL_FEATURES === 'true') {
    return developmentFlags;
  }
  
  return productionFlags;
}

// Check if a feature is enabled
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return getFlags()[feature].enabled;
}

// Check if feature should show in navigation
export function isFeatureInNav(feature: FeatureFlag): boolean {
  return getFlags()[feature].showInNav;
}

// Get redirect URL for disabled features
export function getFeatureRedirect(feature: FeatureFlag): string | undefined {
  return getFlags()[feature].redirectTo;
}

// Get all enabled features
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.entries(getFlags())
    .filter(([, config]) => config.enabled)
    .map(([key]) => key as FeatureFlag);
}

// Get all nav-visible features
export function getNavFeatures(): FeatureFlag[] {
  return Object.entries(getFlags())
    .filter(([, config]) => config.showInNav)
    .map(([key]) => key as FeatureFlag);
}

// Server-side feature check (for middleware/SSR)
export function isFeatureEnabledServer(feature: FeatureFlag): boolean {
  // Always use production flags on server unless explicitly overridden
  if (process.env.NEXT_PUBLIC_ENABLE_ALL_FEATURES === 'true') {
    return developmentFlags[feature].enabled;
  }
  return productionFlags[feature].enabled;
}
