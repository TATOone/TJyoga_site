/**
 * Единственное место на фронтенде, где задаются email с доступом в /admin.
 * Меняйте адреса только здесь (и в зеркале backend/src/config/adminAccess.ts).
 */
export const ADMIN_ACCESS_EMAILS = [
  'tim.ohana@yandex.ru',
  'evgeniawoita@gmail.com',
] as const;

const ALLOWED_ADMIN_EMAILS = new Set<string>(ADMIN_ACCESS_EMAILS);

export const normalizeAdminEmail = (email: string): string => email.trim().toLowerCase();

export const isAdminEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) {
    return false;
  }
  return ALLOWED_ADMIN_EMAILS.has(normalizeAdminEmail(email));
};

export const canAccessAdminPanel = (user: {
  role?: string | null;
  email?: string | null;
} | null | undefined): boolean => user?.role === 'admin' && isAdminEmailAllowed(user.email);
