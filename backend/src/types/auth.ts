import type { UserRole } from './domain.js';

export interface AuthContext {
  userId: string;
  role: UserRole;
  source: 'supabase_jwt' | 'dev_bypass';
}
