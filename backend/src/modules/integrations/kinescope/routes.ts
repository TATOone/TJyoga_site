import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { env } from '../../../config/env.js';
import { ApiError, success } from '../../../lib/http.js';
import { evaluateSubscriptionAccess } from '../../subscriptions/access.js';
import { requireRoles } from '../../../security/rbac.js';

const kinescopeAuthSchema = z.object({
  user_id: z.string().uuid(),
  video_id: z.string().min(1),
  video_access_level: z.enum(['club_active', 'public']).default('club_active'),
});

export const kinescopeRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/integrations/kinescope/auth',
    {
      preHandler: [app.authenticate, requireRoles(['user'])],
      config: {
        rateLimit: {
          max: 100,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const sharedSecret = request.headers['x-kinescope-secret'];
      if (typeof sharedSecret !== 'string' || sharedSecret !== env.KINESCOPE_AUTH_SECRET) {
        throw new ApiError('UNAUTHORIZED', 'Некорректный Kinescope shared secret');
      }

      const payload = kinescopeAuthSchema.parse(request.body);

      if (!request.auth || payload.user_id !== request.auth.userId) {
        throw new ApiError('FORBIDDEN', 'Идентификатор пользователя не совпадает с авторизованной сессией', {
          code: 'USER_ID_MISMATCH',
        });
      }

      const user = app.store.getUserById(payload.user_id);
      if (!user) {
        throw new ApiError('FORBIDDEN', 'Пользователь не найден');
      }

      if (payload.video_access_level === 'public') {
        reply.header('Cache-Control', 'no-store');
        return success(request, {
          decision: 'allow',
          reason: 'public_video',
          user_id: user.id,
          video_id: payload.video_id,
        });
      }

      const subscription = app.store.getSubscriptionByUserId(user.id);
      const decision = evaluateSubscriptionAccess(subscription, env.SUBSCRIPTION_GRACE_HOURS);
      const allowed = decision.allowed;

      request.log.info(
        {
          event: 'kinescope_auth_decision',
          user_id: payload.user_id,
          video_id: payload.video_id,
          subscription_status: decision.status,
          decision: allowed ? 'allow' : 'deny',
          reason: decision.reason,
          request_id: request.id,
        },
        'Kinescope authorization decision',
      );

      reply.header('Cache-Control', 'no-store');
      if (!allowed) {
        throw new ApiError('SUBSCRIPTION_REQUIRED', 'Требуется активная подписка', {
          decision_reason: decision.reason,
        });
      }

      return success(request, {
        decision: 'allow',
        reason: decision.reason,
        user_id: payload.user_id,
        video_id: payload.video_id,
        effective_until: decision.effectiveUntil,
      });
    },
  );
};
