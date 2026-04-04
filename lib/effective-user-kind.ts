import type { PublisherProfileType, User } from '@/lib/types';

export type EffectiveUserKind = User['role'] | PublisherProfileType;

export function getEffectiveUserKind(input: {
  authRole?: User['role'] | null;
  publisherType?: PublisherProfileType | null;
}): EffectiveUserKind {
  if (input.authRole === 'admin') return 'admin';
  if (input.authRole === 'sitter') return 'sitter';
  if (input.publisherType) return input.publisherType;
  return input.authRole ?? 'owner';
}

export function getDefaultDashboardForEffectiveKind(kind: EffectiveUserKind): string {
  switch (kind) {
    case 'admin':
      return '/admin';
    case 'sitter':
    case 'čuvar':
      return '/dashboard/sitter';
    case 'groomer':
      return '/dashboard/groomer';
    case 'trener':
      return '/dashboard/trainer';
    case 'udomljavanje':
      return '/dashboard/adoption';
    case 'uzgajivač':
    case 'veterinar':
      return '/dashboard/profile';
    case 'owner':
    case 'vlasnik':
    default:
      return '/dashboard/vlasnik';
  }
}
