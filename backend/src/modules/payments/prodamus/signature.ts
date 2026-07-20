import { createHmac, timingSafeEqual } from 'node:crypto';

const normalizeSignature = (signature: string): string => signature.trim().replace(/^sha256=/i, '');

export const verifyProdamusSignature = (params: {
  rawBody: string;
  providedSignature: string;
  secret: string;
  algorithm: 'sha256';
}): boolean => {
  const expectedHex = createHmac(params.algorithm, params.secret).update(params.rawBody, 'utf8').digest('hex');
  const providedHex = normalizeSignature(params.providedSignature);

  const expectedBuffer = Buffer.from(expectedHex, 'hex');
  const providedBuffer = Buffer.from(providedHex, 'hex');

  if (expectedBuffer.length === 0 || providedBuffer.length === 0 || expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
};
