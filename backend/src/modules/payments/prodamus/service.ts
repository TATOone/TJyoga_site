import type { FastifyRequest } from 'fastify';
import type { BackendStore } from '../../../persistence/store.js';
import type { ProdamusWebhookPayload } from './schema.js';

export interface ProcessWebhookResult {
  duplicate: boolean;
  subscriptionActivated: boolean;
  dedupKey: string;
}

const pickEventIdFromRawPayload = (rawPayload?: Record<string, unknown>): string | null => {
  if (!rawPayload) {
    return null;
  }

  const eventId = rawPayload.event_id;
  if (typeof eventId === 'string' && eventId.length > 0) {
    return eventId;
  }
  return null;
};

export const buildProdamusDedupKey = (payload: ProdamusWebhookPayload): string => {
  const eventId = pickEventIdFromRawPayload(payload.raw);
  if (eventId) {
    return `prodamus:${eventId}`;
  }

  return `prodamus:${payload.provider_payment_id}:${payload.status}:${payload.amount_rub}`;
};

export const processProdamusWebhook = (params: {
  request: FastifyRequest;
  payload: ProdamusWebhookPayload;
  store: BackendStore;
  signatureValid: boolean;
}): ProcessWebhookResult => {
  const dedupKey = buildProdamusDedupKey(params.payload);
  const eventResult = params.store.recordPaymentEvent({
    dedupKey,
    providerPaymentId: params.payload.provider_payment_id,
    providerOrderId: params.payload.provider_order_id ?? null,
    eventStatus: params.payload.status,
    amountRub: params.payload.amount_rub,
    signatureValid: params.signatureValid,
    payload: params.payload.raw ?? {},
  });

  if (eventResult.duplicate) {
    return {
      duplicate: true,
      subscriptionActivated: false,
      dedupKey,
    };
  }

  let subscriptionActivated = false;
  if (params.payload.status === 'paid' && params.payload.provider_order_id) {
    const order = params.store.getOrderByProviderOrderId(params.payload.provider_order_id);
    if (order) {
      const paidAt = params.payload.paid_at ?? new Date().toISOString();
      const paidOrder = params.store.markOrderPaid(order.id);
      if (paidOrder) {
        params.store.savePayment({
          orderId: paidOrder.id,
          provider: 'prodamus',
          providerPaymentId: params.payload.provider_payment_id,
          status: 'succeeded',
          amountRub: params.payload.amount_rub,
          paidAt,
        });

        const subscription = params.store.upsertSubscriptionForOrder(paidOrder, paidAt);
        params.store.saveSubscriptionEvent({
          subscriptionId: subscription.id,
          eventType: 'activated',
          actorType: 'system',
          actorUserId: null,
          reason: 'prodamus_webhook_paid',
        });
        subscriptionActivated = true;
      }
    }
  }

  params.store.saveAudit({
    actorUserId: null,
    actorRole: 'system',
    action: 'prodamus_webhook_processed',
    entityType: 'payment_event',
    entityId: eventResult.event.id,
    beforeState: null,
    afterState: {
      provider_payment_id: params.payload.provider_payment_id,
      status: params.payload.status,
      dedup_key: dedupKey,
      subscription_activated: subscriptionActivated,
    },
    requestId: params.request.id,
    ip: params.request.ip,
    userAgent: params.request.headers['user-agent'] ?? null,
  });

  return {
    duplicate: false,
    subscriptionActivated,
    dedupKey,
  };
};
