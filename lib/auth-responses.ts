import type { User } from '@/lib/types';

export interface RegisterSuccessResponse {
  user: unknown;
  session: unknown;
  needsEmailConfirmation: boolean;
  role: Extract<User['role'], 'owner' | 'sitter'>;
}

export interface LoginSuccessResponse {
  user: unknown;
  role: User['role'];
  defaultRedirect: string;
}
