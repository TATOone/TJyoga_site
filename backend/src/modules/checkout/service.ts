import { randomUUID } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import {
  PLAN_CATALOG,
  REQUIRED_CHECKOUT_CONSENTS,
  resolvePlanCode,
} from '../../config/plans.js';
import { ApiError } from '../../lib/http.js';
import { buildIdempotencyExpiry, hashRequestBody, isIdempotencyExpired } from '../../lib/idempotency.js';
import type { BackendStore } from '../../persistence/store.js';
import { createProdamusPaymentLink } from '../payments/prodamus/client.js';
import type { CheckoutSessionRequest } from './schema.js';

export interface CheckoutSessionResponse {
  order_id: string;
  status: 'pending_payment';
  payment_provider: 'prodamus';
  payment_url: string;
  expires_at: string;
}

const validateConsents = (acceptConsents: CheckoutSessionRequest['accept_consents']): void => {
  const accepted = new Map(acceptConsents.map((consent) => [consent.doc_type, consent.version]));

  for (const requiredDocType of REQUIRED_CHECKOUT_CONSENTS) {
    const version = accepted.get(requiredDocType);
    if (!version) {
      throw new ApiError('VALIDATION_ERROR', `Отсутствует обязательное согласие: ${requiredDocType}`);
    }
  }
};

export const createCheckoutSession = async (params: {
  request: FastifyRequest;
  store: BackendStore;
  userId: string;
  idempotencyKey: string;
  payload: CheckoutSessionRequest;
}): Promise<{ statusCode: 200 | 201; body: CheckoutSessionResponse; isReplay: boolean }> => {
  const requestHash = hashRequestBody(params.payload);
  const existing = params.store.getIdempotencyRecord(params.idempotencyKey);

  if (existing) {
    if (isIdempotencyExpired(existing.expiresAt)) {
      // expired record is ignored and replaced below
    } else if (existing.requestHash !== requestHash) {
      throw new ApiError('IDEMPOTENCY_CONFLICT', 'Idempotency-Key уже использован с другим телом запроса');
    } else {
      return {
        statusCode: existing.statusCode as 200 | 201,
        body: existing.responseBody as unknown as CheckoutSessionResponse,
        isReplay: true,
      };
    }
  }

  const plan = resolvePlanCode(params.payload.plan_code);
  if (!plan) {
    throw new ApiError('VALIDATION_ERROR', 'Неверный plan_code', {
      plan_code: params.payload.plan_code,
    });
  }

  validateConsents(params.payload.accept_consents);

  const user = params.store.getUserById(params.userId);
  if (!user) {
    throw new ApiError('UNAUTHORIZED', 'Пользователь не найден');
  }

  params.store.saveUserConsents(
    params.payload.accept_consents.map((consent) => ({
      userId: params.userId,
      docType: consent.doc_type,
      version: consent.version,
      source: 'checkout',
    })),
  );

  const orderId = randomUUID();
  const paymentLink = await createProdamusPaymentLink({
    orderId,
    amountRub: plan.amountRub,
    productName: plan.title,
    customerEmail: params.payload.customer_email ?? user.email,
    customerPhone: params.payload.customer_phone,
    customerExtra: params.payload.customer_extra,
    returnUrlSuccess: params.payload.return_url_success,
    returnUrlError: params.payload.return_url_error,
  });

  const order = params.store.createOrder({
    userId: params.userId,
    planCode: plan.code,
    amountRub: plan.amountRub,
    idempotencyKey: params.idempotencyKey,
    providerOrderId: paymentLink.providerOrderId,
    paymentUrl: paymentLink.paymentUrl,
    paymentExpiresAt: paymentLink.expiresAt,
  });

  const responseBody: CheckoutSessionResponse = {
    order_id: order.id,
    status: 'pending_payment',
    payment_provider: 'prodamus',
    payment_url: paymentLink.paymentUrl,
    expires_at: paymentLink.expiresAt,
  };

  params.store.saveIdempotencyRecord({
    key: params.idempotencyKey,
    requestHash,
    responseBody: responseBody as unknown as Record<string, unknown>,
    statusCode: 201,
    createdAt: new Date().toISOString(),
    expiresAt: buildIdempotencyExpiry(),
  });

  params.store.saveAudit({
    actorUserId: params.userId,
    actorRole: user.role,
    action: 'checkout_session_created',
    entityType: 'order',
    entityId: order.id,
    beforeState: null,
    afterState: {
      plan_code: plan.code,
      amount_rub: plan.amountRub,
      provider_order_id: order.providerOrderId,
    },
    requestId: params.request.id,
    ip: params.request.ip,
    userAgent: params.request.headers['user-agent'] ?? null,
  });

  return {
    statusCode: 201,
    body: responseBody,
    isReplay: false,
  };
};

export const getCheckoutOrderStatus = (
  store: BackendStore,
  orderId: string,
  userId: string,
): {
  order_id: string;
  status: string;
  plan_code: string;
  amount_rub: number;
  payment_provider: 'prodamus';
  payment_url: string | null;
  expires_at: string | null;
  subscription_status: string | null;
} => {
  const order = store.getOrderById(orderId);
  if (!order || order.userId !== userId) {
    throw new ApiError('NOT_FOUND', 'Заказ не найден');
  }

  const subscription = store.getSubscriptionByUserId(userId);

  return {
    order_id: order.id,
    status: order.status,
    plan_code: order.planCode,
    amount_rub: order.amountRub,
    payment_provider: 'prodamus',
    payment_url: order.paymentUrl,
    expires_at: order.paymentExpiresAt,
    subscription_status: subscription?.status ?? null,
  };
};

export const getPlanAmountRub = (planCode: string): number | null => PLAN_CATALOG[planCode]?.amountRub ?? null;
