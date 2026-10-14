/**
 * Единственное место на бэкенде, где задаются email с доступом к admin API.
 * Меняйте адреса только здесь (и в зеркале src/config/adminAccess.ts).
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
