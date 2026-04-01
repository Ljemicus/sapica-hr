import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User } from '@/lib/types';

export interface RegisterSuccessResponse {
  user: SupabaseUser;
  session: Session | null;
  needsEmailConfirmation: boolean;
  role: Extract<User['role'], 'owner' | 'sitter'>;
}

export interface LoginSuccessResponse {
  user: SupabaseUser;
  role: User['role'];
  defaultRedirect: string;
}
