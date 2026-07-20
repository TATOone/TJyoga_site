import type { FastifyPluginAsync } from 'fastify';
import { env } from '../../../config/env.js';
import { ApiError, success } from '../../../lib/http.js';
import { processProdamusWebhook } from './service.js';
import { prodamusWebhookPayloadSchema } from './schema.js';
import { verifyProdamusSignature } from './signature.js';

export const prodamusRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/payments/prodamus/webhook',
    {
      config: {
        rawBody: true,
        rateLimit: {
          max: 120,
          timeWindow: '1 minute',
        },
      },
    },
    async (request) => {
      const signatureHeaderName = env.PRODAMUS_SIGNATURE_HEADER.toLowerCase();
      const signatureHeaderValue = request.headers[signatureHeaderName];
      const signature =
        typeof signatureHeaderValue === 'string'
          ? signatureHeaderValue
          : signatureHeaderValue instanceof Buffer
            ? signatureHeaderValue.toString('utf8')
          : Array.isArray(signatureHeaderValue)
            ? String(signatureHeaderValue[0])
            : null;

      if (!signature) {
        throw new ApiError('SIGNATURE_INVALID', 'Отсутствует подпись webhook');
      }

      if (!request.rawBody) {
        throw new ApiError('VALIDATION_ERROR', 'raw body недоступен для проверки подписи');
      }
      const rawBody = typeof request.rawBody === 'string' ? request.rawBody : request.rawBody.toString('utf8');

      const signatureValid = verifyProdamusSignature({
        rawBody,
        providedSignature: signature,
        secret: env.PRODAMUS_WEBHOOK_SECRET,
        algorithm: env.PRODAMUS_SIGNATURE_ALGO,
      });

      if (!signatureValid) {
        app.store.recordPaymentEvent({
          dedupKey: `prodamus:invalid:${Date.now()}`,
          providerPaymentId: 'unknown',
          providerOrderId: null,
          eventStatus: 'failed',
          amountRub: 0,
          signatureValid: false,
          payload: {
            reason: 'signature_invalid',
          },
        });
        throw new ApiError('SIGNATURE_INVALID', 'Подпись webhook невалидна');
      }

      const payload = prodamusWebhookPayloadSchema.parse(request.body);
      const result = processProdamusWebhook({
        request,
        payload,
        store: app.store,
        signatureValid: true,
      });

      request.log.info(
        {
          event: 'prodamus_webhook_processed',
          provider_payment_id: payload.provider_payment_id,
          provider_order_id: payload.provider_order_id,
          dedup_key: result.dedupKey,
          duplicate: result.duplicate,
          subscription_activated: result.subscriptionActivated,
          request_id: request.id,
        },
        'Prodamus webhook processed',
      );

      return success(request, {
        accepted: true,
        duplicate: result.duplicate,
        dedup_key: result.dedupKey,
      });
    },
  );
};
