import type { FastifyPluginAsync } from 'fastify';
import { success } from '../../lib/http.js';
import { ApiError } from '../../lib/http.js';
import { requireRoles } from '../../security/rbac.js';
import { checkoutSessionRequestSchema } from './schema.js';
import { createCheckoutSession, getCheckoutOrderStatus } from './service.js';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const checkoutRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/checkout/session',
    {
      preHandler: [app.authenticate, requireRoles(['user'])],
    },
    async (request, reply) => {
      const idempotencyKeyHeader = request.headers['idempotency-key'];
      const idempotencyKey =
        typeof idempotencyKeyHeader === 'string' ? idempotencyKeyHeader.trim() : null;

      if (!idempotencyKey || !UUID_V4_PATTERN.test(idempotencyKey)) {
        throw new ApiError('VALIDATION_ERROR', 'Требуется валидный Idempotency-Key (uuid v4)');
      }

      const payload = checkoutSessionRequestSchema.parse(request.body);
      const auth = request.auth;
      if (!auth) {
        throw new ApiError('UNAUTHORIZED', 'Требуется авторизация');
      }

      const result = await createCheckoutSession({
        request,
        store: app.store,
        userId: auth.userId,
        idempotencyKey,
        payload,
      });

      reply.status(result.statusCode);
      return success(request, result.body);
    },
  );

  app.get(
    '/checkout/orders/:orderId',
    {
      preHandler: [app.authenticate, requireRoles(['user'])],
    },
    async (request) => {
      const auth = request.auth;
      if (!auth) {
        throw new ApiError('UNAUTHORIZED', 'Требуется авторизация');
      }

      const params = request.params as { orderId: string };
      const data = getCheckoutOrderStatus(app.store, params.orderId, auth.userId);
      return success(request, data);
    },
  );
};
