import { env } from '../../../config/env.js';
import { ApiError } from '../../../lib/http.js';
import { createProdamusRequestSignature } from './hmac.js';

export interface CreateProdamusPaymentLinkInput {
  orderId: string;
  amountRub: number;
  productName: string;
  customerEmail: string;
  customerPhone?: string;
  customerExtra?: string;
  returnUrlSuccess: string;
  returnUrlError: string;
}

export interface CreateProdamusPaymentLinkResult {
  paymentUrl: string;
  providerOrderId: string;
  expiresAt: string;
}

const buildStubPaymentUrl = (input: CreateProdamusPaymentLinkInput): CreateProdamusPaymentLinkResult => {
  const expiresAt = new Date(Date.now() + 45 * 60 * 1000).toISOString();
  const providerOrderId = input.orderId;
  const params = new URLSearchParams({
    order_id: providerOrderId,
    customer_email: input.customerEmail,
  });

  return {
    paymentUrl: `${env.PRODAMUS_PAYFORM_URL.replace(/\/+$/, '')}/?${params.toString()}`,
    providerOrderId,
    expiresAt,
  };
};

const readProdamusSecret = (): string | null => {
  if (env.PRODAMUS_PAYFORM_SECRET) {
    return env.PRODAMUS_PAYFORM_SECRET;
  }

  if (env.PRODAMUS_MODE === 'live' && env.PRODAMUS_API_KEY_LIVE) {
    return env.PRODAMUS_API_KEY_LIVE;
  }

  if (env.PRODAMUS_API_KEY_TEST) {
    return env.PRODAMUS_API_KEY_TEST;
  }

  return null;
};

export const createProdamusPaymentLink = async (
  input: CreateProdamusPaymentLinkInput,
): Promise<CreateProdamusPaymentLinkResult> => {
  const secret = readProdamusSecret();
  if (!secret || env.PRODAMUS_STUB_ENABLED) {
    return buildStubPaymentUrl(input);
  }

  const amountRub = Math.round(input.amountRub / 100);
  const payload: Record<string, unknown> = {
    do: 'link',
    order_id: input.orderId,
    customer_email: input.customerEmail,
    urlReturn: input.returnUrlError,
    urlSuccess: input.returnUrlSuccess,
    products: [
      {
        name: input.productName,
        price: String(amountRub),
        quantity: '1',
        type: 'service',
      },
    ],
  };

  if (input.customerPhone) {
    payload.customer_phone = input.customerPhone;
  }

  if (input.customerExtra) {
    payload.customer_extra = input.customerExtra;
  }

  if (env.PRODAMUS_SYS_CODE) {
    payload.sys = env.PRODAMUS_SYS_CODE;
  }

  payload.signature = createProdamusRequestSignature(payload, secret);

  const payformUrl = env.PRODAMUS_PAYFORM_URL.replace(/\/+$/, '/');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(payformUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(flattenPayload(payload)).toString(),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError('PROVIDER_UNAVAILABLE', 'Prodamus не вернул ссылку на оплату', {
        status: response.status,
      });
    }

    const paymentUrl = (await response.text()).trim();
    if (!paymentUrl.startsWith('http')) {
      throw new ApiError('PROVIDER_UNAVAILABLE', 'Prodamus вернул некорректную ссылку на оплату');
    }

    return {
      paymentUrl,
      providerOrderId: input.orderId,
      expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('PROVIDER_UNAVAILABLE', 'Не удалось создать платёжную ссылку Prodamus');
  } finally {
    clearTimeout(timeout);
  }
};

const flattenPayload = (payload: Record<string, unknown>, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(payload)) {
    const nextKey = prefix ? `${prefix}[${key}]` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(result, flattenPayload(item as Record<string, unknown>, `${nextKey}[${index}]`));
        } else {
          result[`${nextKey}[${index}]`] = String(item);
        }
      });
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenPayload(value as Record<string, unknown>, nextKey));
      continue;
    }

    result[nextKey] = String(value);
  }

  return result;
};
