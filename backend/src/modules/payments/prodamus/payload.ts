import { prodamusWebhookPayloadSchema, type ProdamusWebhookPayload } from './schema.js';

const STATUS_ALIASES: Record<string, ProdamusWebhookPayload['status']> = {
  success: 'paid',
  paid: 'paid',
  error: 'failed',
  failed: 'failed',
  declined: 'declined',
  order_denied: 'declined',
  order_canceled: 'declined',
  refund: 'refunded',
  refunded: 'refunded',
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Buffer.isBuffer(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

const readString = (record: Record<string, unknown>, keys: readonly string[]): string | null => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return null;
};

const parsePhpPath = (key: string): string[] => {
  const path: string[] = [];
  const regex = /([^[\]]+)|\[([^[\]]*)\]/g;
  let match: RegExpExecArray | null = regex.exec(key);
  while (match) {
    if (match[1] !== undefined) {
      path.push(match[1]);
    } else {
      path.push(match[2] ?? '');
    }
    match = regex.exec(key);
  }
  return path.length > 0 ? path : [key];
};

const setPath = (root: Record<string, unknown>, path: string[], value: unknown): void => {
  let cursor = root;
  for (let index = 0; index < path.length; index += 1) {
    const part = path[index] === '' ? String(Object.keys(cursor).length) : path[index];
    const isLast = index === path.length - 1;
    if (isLast) {
      cursor[part] = value;
      return;
    }
    const existing = cursor[part];
    if (!existing || typeof existing !== 'object' || Array.isArray(existing)) {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }
};

const arrayify = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(arrayify);
  }
  if (!value || typeof value !== 'object') {
    return value;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  const mapped: Record<string, unknown> = {};
  for (const key of keys) {
    mapped[key] = arrayify(record[key]);
  }

  const sequential = keys.length > 0 && keys.every((key, index) => key === String(index));
  if (sequential) {
    return keys.map((key) => mapped[key]);
  }
  return mapped;
};

/** PHP $_POST-style nested keys (`products[0][name]`) so HMAC matches Hmac::verify($_POST). */
export const expandPhpFormRecord = (record: Record<string, unknown>): Record<string, unknown> => {
  const needsExpand = Object.keys(record).some((key) => key.includes('['));
  if (!needsExpand) {
    return record;
  }

  const nested: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (key.includes('[')) {
      setPath(nested, parsePhpPath(key), value);
    } else {
      nested[key] = value;
    }
  }
  return arrayify(nested) as Record<string, unknown>;
};

const parseAmountRubKopecks = (record: Record<string, unknown>): number | null => {
  if (record.amount_rub !== undefined && record.amount_rub !== null && record.amount_rub !== '') {
    const direct = Number(record.amount_rub);
    if (Number.isFinite(direct)) {
      return Math.round(direct);
    }
  }

  const raw = readString(record, ['order_sum', 'sum']);
  if (!raw) {
    return null;
  }
  const numeric = Number(raw.replace(',', '.'));
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.round(numeric * 100);
};

const toIsoDateTime = (value: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return new Date(parsed).toISOString();
};

export const parseWebhookBody = (body: unknown, rawBody: string): Record<string, unknown> | null => {
  const fromBody = asRecord(body);
  if (fromBody && Object.keys(fromBody).length > 0) {
    return expandPhpFormRecord(fromBody);
  }

  const trimmed = rawBody.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const record = asRecord(parsed);
    return record ? expandPhpFormRecord(record) : null;
  } catch {
    const params = new URLSearchParams(trimmed);
    const record: Record<string, unknown> = {};
    for (const [key, value] of params.entries()) {
      record[key] = value;
    }
    return Object.keys(record).length > 0 ? expandPhpFormRecord(record) : null;
  }
};

export const normalizeProdamusWebhookPayload = (record: Record<string, unknown>): ProdamusWebhookPayload => {
  if (typeof record.provider_payment_id === 'string') {
    return prodamusWebhookPayloadSchema.parse({
      ...record,
      raw: record.raw ?? record,
    });
  }

  const statusKey = readString(record, ['payment_status', 'status'])?.toLowerCase() ?? '';
  const status = STATUS_ALIASES[statusKey];
  const providerPaymentId = readString(record, ['payment_id', 'order_id', 'provider_payment_id']);
  const amountRub = parseAmountRubKopecks(record);

  return prodamusWebhookPayloadSchema.parse({
    provider_payment_id: providerPaymentId,
    provider_order_id: readString(record, ['order_num', 'provider_order_id', 'order_id']),
    status,
    amount_rub: amountRub,
    paid_at: toIsoDateTime(readString(record, ['paid_at', 'date'])),
    raw: record,
  });
};
