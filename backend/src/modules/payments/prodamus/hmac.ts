import { createHmac } from 'node:crypto';

const stringifyValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => stringifyValue(item));
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    const sortedKeys = Object.keys(record).sort();
    const next: Record<string, unknown> = {};

    for (const key of sortedKeys) {
      next[key] = stringifyValue(record[key]);
    }

    return next;
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
};

export const createProdamusRequestSignature = (
  data: Record<string, unknown>,
  secret: string,
): string => {
  const normalized = stringifyValue(data) as Record<string, unknown>;
  const json = JSON.stringify(normalized).replace(/\//g, '\\/');
  return createHmac('sha256', secret).update(json, 'utf8').digest('hex');
};
