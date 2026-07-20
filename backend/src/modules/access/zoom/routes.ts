import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ApiError, success } from '../../../lib/http.js';
import { requireRoles } from '../../../security/rbac.js';
import { evaluateSubscriptionAccess } from '../../subscriptions/access.js';
import { env } from '../../../config/env.js';

const zoomParamsSchema = z.object({
  room: z.string().min(1).max(100),
});

const querySchema = z.object({
  dry_run: z.coerce.boolean().default(false),
  format: z.enum(['redirect', 'json']).default('redirect'),
});

export const zoomAccessRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/access/zoom/:room',
    {
      preHandler: [app.authenticate, requireRoles(['user'])],
      config: {
        rateLimit: {
          max: 50,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const auth = request.auth;
      if (!auth) {
        throw new ApiError('UNAUTHORIZED', 'Требуется авторизация');
      }

      const params = zoomParamsSchema.parse(request.params);
      const query = querySchema.parse(request.query);

      const subscription = app.store.getSubscriptionByUserId(auth.userId);
      const accessDecision = evaluateSubscriptionAccess(subscription, env.SUBSCRIPTION_GRACE_HOURS);

      if (!accessDecision.allowed) {
        app.store.saveZoomRedirectLog({
          userId: auth.userId,
          zoomLinkId: null,
          room: params.room,
          result: 'denied',
          reason: accessDecision.reason,
          ip: request.ip,
          userAgent: request.headers['user-agent'] ?? null,
          requestId: request.id,
        });

        throw new ApiError('SUBSCRIPTION_REQUIRED', 'Требуется активная подписка', {
          subscription_status: accessDecision.status,
          decision_reason: accessDecision.reason,
        });
      }

      const zoomLink = app.store.getActiveZoomLink(params.room);
      if (!zoomLink) {
        throw new ApiError('NOT_FOUND', 'Активная Zoom-комната не найдена', {
          room: params.room,
        });
      }

      app.store.saveZoomRedirectLog({
        userId: auth.userId,
        zoomLinkId: zoomLink.id,
        room: params.room,
        result: 'allowed',
        reason: 'ok',
        ip: request.ip,
        userAgent: request.headers['user-agent'] ?? null,
        requestId: request.id,
      });

      request.log.info(
        {
          event: 'zoom_redirect',
          user_id: auth.userId,
          room: params.room,
          zoom_link_id: zoomLink.id,
          decision: query.dry_run ? 'dry_run_allow' : 'allow',
          request_id: request.id,
        },
        'Zoom redirect decision',
      );

      if (query.dry_run) {
        return success(request, {
          allowed: true,
          room: params.room,
          zoom_link_id: zoomLink.id,
          redirect_target_masked: true,
        });
      }

      reply.header('Cache-Control', 'no-store');

      // JSON для SPA: Bearer нельзя передать через window.open на 302.
      if (query.format === 'json') {
        return success(request, {
          allowed: true,
          room: params.room,
          zoom_link_id: zoomLink.id,
          redirect_url: zoomLink.targetUrl,
        });
      }

      reply.redirect(zoomLink.targetUrl, 302);
      return reply;
    },
  );
};
