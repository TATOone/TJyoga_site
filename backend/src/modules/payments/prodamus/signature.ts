import { createHmac, timingSafeEqual } from 'node:crypto';
import { createProdamusRequestSignature } from './hmac.js';

const normalizeSignature = (signature: string): string => signature.trim().replace(/^sha256=/i, '');

const equalHex = (expectedHex: string, providedHex: string): boolean => {
  const expectedBuffer = Buffer.from(expectedHex, 'hex');
  const providedBuffer = Buffer.from(providedHex, 'hex');

  if (expectedBuffer.length === 0 || providedBuffer.length === 0 || expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
};

const payloadWithoutSignature = (payload: Record<string, unknown>): Record<string, unknown> => {
  const next: Record<string, unknown> = { ...payload };
  delete next.signature;
  delete next.Sign;
  delete next.sign;
  return next;
};

/**
 * Official Prodamus check: Hmac::verify($_POST, secret, headers.Sign).
 * Same algorithm as outbound link signatures (stringify values, sort keys, JSON, escape `/`, HMAC-SHA256).
 * Also accepts HMAC of the raw body so previously signed JSON tests keep working.
 */
export const verifyProdamusSignature = (params: {
  payload?: Record<string, unknown> | null;
  rawBody: string;
  providedSignature: string;
  secret: string;
  algorithm: 'sha256';
}): boolean => {
  const providedHex = normalizeSignature(params.providedSignature);
  const candidates: string[] = [];

  if (params.payload && typeof params.payload === 'object') {
    candidates.push(createProdamusRequestSignature(payloadWithoutSignature(params.payload), params.secret));
  }

  candidates.push(createHmac(params.algorithm, params.secret).update(params.rawBody, 'utf8').digest('hex'));

  return candidates.some((expectedHex) => equalHex(expectedHex, providedHex));
};

export const readProdamusSignatureHeader = (
  headers: Record<string, unknown>,
  configuredHeader: string,
): string | null => {
  const names = new Set(
    ['sign', configuredHeader.toLowerCase(), 'x-prodamus-signature'].map((name) => name.toLowerCase()),
  );

  for (const name of names) {
    const value = headers[name];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    if (value instanceof Buffer && value.length > 0) {
      return value.toString('utf8');
    }
    if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
      return value[0];
    }
  }

  return null;
};
