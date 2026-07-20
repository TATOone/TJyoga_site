import { describe, expect, it } from 'vitest';
import {
  hashPassword,
  hashPasswordScryptLegacy,
  verifyPassword,
} from '../src/security/password.js';

describe('password hashing', () => {
  it('hashes and verifies with argon2id', async () => {
    const stored = await hashPassword('student-demo-pass');
    expect(stored.startsWith('argon2id$')).toBe(true);

    const result = await verifyPassword('student-demo-pass', stored);
    expect(result.ok).toBe(true);
    expect(result.needsRehash).toBe(false);
  });

  it('verifies legacy scrypt and flags rehash', async () => {
    const legacy = hashPasswordScryptLegacy('legacy-pass');
    expect(legacy.startsWith('scrypt$')).toBe(true);

    const ok = await verifyPassword('legacy-pass', legacy);
    expect(ok.ok).toBe(true);
    expect(ok.needsRehash).toBe(true);

    const bad = await verifyPassword('wrong', legacy);
    expect(bad.ok).toBe(false);
  });

  it('verifies pre-prefix scrypt format', async () => {
    const salt = '00000000-0000-4000-8000-000000000099';
    const { scryptSync } = await import('node:crypto');
    const digest = scryptSync('old-pass', salt, 64).toString('hex');
    const stored = `${salt}:${digest}`;

    const result = await verifyPassword('old-pass', stored);
    expect(result.ok).toBe(true);
    expect(result.needsRehash).toBe(true);
  });
});
