import type { UserRole } from './domain.js';

export interface AuthContext {
  userId: string;
  role: UserRole;
  email: string | null;
  source: 'supabase_jwt' | 'dev_bypass';
}
