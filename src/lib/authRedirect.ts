export const ACCOUNT_HOME_PATH = '/account';

const isSafeAccountPath = (value: string): boolean =>
  value.startsWith('/account') && !value.startsWith('//') && !value.includes('://');

export const resolvePostAuthPath = (input: { search: string; state: unknown }): string => {
  const fromState =
    typeof input.state === 'object' &&
    input.state !== null &&
    'from' in input.state &&
    typeof (input.state as { from?: unknown }).from === 'string'
      ? (input.state as { from: string }).from
      : null;

  const nextParam = new URLSearchParams(input.search).get('next');
  const candidate = fromState ?? nextParam;

  if (candidate && isSafeAccountPath(candidate)) {
    return candidate;
  }

  return ACCOUNT_HOME_PATH;
};

export const loginPathForAccount = (nextPath: string = ACCOUNT_HOME_PATH): string => {
  const next = isSafeAccountPath(nextPath) ? nextPath : ACCOUNT_HOME_PATH;
  return `/account/login?next=${encodeURIComponent(next)}`;
};
