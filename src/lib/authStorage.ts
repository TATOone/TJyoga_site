const AUTH_STORAGE_KEY = 'tj_yoga_auth_session_v1';
const REMEMBER_FLAG_KEY = 'tj_yoga_auth_remember_v1';

export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string;
  expiresInSec: number;
  user: {
    id: string;
    role: string;
  };
}

export const saveAuthSession = (session: StoredAuthSession, rememberMe = false): void => {
  if (rememberMe) {
    localStorage.setItem(REMEMBER_FLAG_KEY, '1');
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.removeItem(REMEMBER_FLAG_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const loadAuthSession = (): StoredAuthSession | null => {
  const fromLocal = localStorage.getItem(AUTH_STORAGE_KEY);
  const fromSession = sessionStorage.getItem(AUTH_STORAGE_KEY);
  const raw = fromLocal ?? fromSession;
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return null;
  }
};

export const updateAuthSessionTokens = (
  tokens: Pick<StoredAuthSession, 'accessToken' | 'refreshToken' | 'expiresInSec'>,
): StoredAuthSession | null => {
  const current = loadAuthSession();
  if (!current) {
    return null;
  }

  const next: StoredAuthSession = {
    ...current,
    ...tokens,
  };
  const rememberMe = localStorage.getItem(REMEMBER_FLAG_KEY) === '1';
  saveAuthSession(next, rememberMe);
  return next;
};

export const clearAuthSession = (): void => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(REMEMBER_FLAG_KEY);
};

export const isRememberMeEnabled = (): boolean => localStorage.getItem(REMEMBER_FLAG_KEY) === '1';
