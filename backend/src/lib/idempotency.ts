import { createHash } from 'node:crypto';

export const hashRequestBody = (payload: unknown): string =>
  createHash('sha256').update(JSON.stringify(payload)).digest('hex');

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export const buildIdempotencyExpiry = (from = Date.now()): string =>
  new Date(from + IDEMPOTENCY_TTL_MS).toISOString();

export const isIdempotencyExpired = (expiresAtIso: string, now = Date.now()): boolean =>
  Date.parse(expiresAtIso) <= now;
