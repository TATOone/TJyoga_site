import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { hash as argonHash, verify as argonVerify } from '@node-rs/argon2';

const ARGON_PREFIX = 'argon2id$';
const SCRYPT_PREFIX = 'scrypt$';

const argonOptions = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const hashPassword = async (password: string): Promise<string> => {
  const digest = await argonHash(password, argonOptions);
  return `${ARGON_PREFIX}${digest}`;
};

const verifyScrypt = (password: string, storedWithoutPrefix: string): boolean => {
  const [salt, hash] = storedWithoutPrefix.split(':');
  if (!salt || !hash) {
    return false;
  }

  const candidate = scryptSync(password, salt, 64).toString('hex');
  const expectedBuffer = Buffer.from(hash, 'hex');
  const candidateBuffer = Buffer.from(candidate, 'hex');

  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, candidateBuffer);
};

/** Legacy helper for tests that still mint scrypt hashes. */
export const hashPasswordScryptLegacy = (password: string): string => {
  const salt = randomUUID();
  const digest = scryptSync(password, salt, 64).toString('hex');
  return `${SCRYPT_PREFIX}${salt}:${digest}`;
};

export const verifyPassword = async (
  password: string,
  stored: string,
): Promise<{ ok: boolean; needsRehash: boolean }> => {
  if (stored.startsWith(ARGON_PREFIX)) {
    const digest = stored.slice(ARGON_PREFIX.length);
    const ok = await argonVerify(digest, password);
    return { ok, needsRehash: false };
  }

  if (stored.startsWith(SCRYPT_PREFIX)) {
    const ok = verifyScrypt(password, stored.slice(SCRYPT_PREFIX.length));
    return { ok, needsRehash: ok };
  }

  // Pre-migration format: salt:hash (scrypt)
  const ok = verifyScrypt(password, stored);
  return { ok, needsRehash: ok };
};
