import { allowedOrigins, env, PUBLIC_SITE_ORIGINS } from '../config/env.js';

const localHostnames = new Set(['localhost', '127.0.0.1']);

export const checkoutReturnOrigins = (): Set<string> =>
  new Set<string>([...allowedOrigins, ...PUBLIC_SITE_ORIGINS]);

export const isAllowedCheckoutReturnUrl = (value: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (parsed.username || parsed.password) {
    return false;
  }

  if (!checkoutReturnOrigins().has(parsed.origin)) {
    return false;
  }

  if (parsed.protocol === 'https:') {
    return true;
  }

  return (
    parsed.protocol === 'http:' &&
    env.NODE_ENV !== 'production' &&
    localHostnames.has(parsed.hostname)
  );
};
