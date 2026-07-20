import { randomUUID } from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { PLAN_CATALOG } from '../../config/plans.js';
import { ApiError, success } from '../../lib/http.js';
import { requireRoles } from '../../security/rbac.js';

const videoUpsertSchema = z.object({
  id: z.string().optional(),
  kinescope_id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  category: z.enum(['practices', 'seminars', 'philosophy', 'new']),
  access_level: z.enum(['club_active', 'public']).default('club_active'),
  duration_min: z.coerce.number().int().positive().default(60),
  status: z.enum(['published', 'draft']).default('published'),
});

const articleUpsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).default(''),
  body: z.string().min(1),
  category: z.enum(['open', 'technique', 'lifestyle', 'club-news']),
  access: z.enum(['public', 'club']),
  status: z.enum(['published', 'draft']).default('published'),
});

const zoomUpsertSchema = z.object({
  room: z.string().min(1).max(100).default('main'),
  target_url: z.string().url(),
  status: z.enum(['active', 'inactive', 'rotating']).default('active'),
});

const extendSubscriptionSchema = z.object({
  user_id: z.string().uuid(),
  ends_at: z.string().datetime(),
});

export const adminRoutes: FastifyPluginAsync = async (app) => {
  const adminGuard = {
    preHandler: [app.authenticate, requireRoles(['admin', 'editor'])],
  };

  app.get('/admin/overview', adminGuard, async (request) => {
    return success(request, {
      users_count: app.store.listUsers().length,
      subscriptions_count: app.store.listSubscriptions().length,
      orders_count: app.store.listOrders().length,
      payments_count: app.store.listPayments().length,
      videos_count: app.store.listVideos({ includeDrafts: true }).length,
      articles_count: app.store.listArticles({ includeDrafts: true }).length,
      plans: Object.values(PLAN_CATALOG),
    });
  });

  app.get('/admin/users', adminGuard, async (request) => {
    const users = app.store.listUsers().map((user) => {
      const subscription = app.store.getSubscriptionByUserId(user.id);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        subscription: subscription
          ? {
              status: subscription.status,
              plan_code: subscription.planCode,
              ends_at: subscription.endsAt,
            }
          : null,
      };
    });
    return success(request, { users });
  });

  app.get('/admin/subscriptions', adminGuard, async (request) => {
    const subscriptions = app.store.listSubscriptions().map((item) => ({
      id: item.id,
      user_id: item.userId,
      plan_code: item.planCode,
      status: item.status,
      starts_at: item.startsAt,
      ends_at: item.endsAt,
      grace_ends_at: item.graceEndsAt,
      manual_extended_until: item.manualExtendedUntil,
    }));
    return success(request, { subscriptions });
  });

  app.post(
    '/admin/subscriptions/extend',
    {
      preHandler: [app.authenticate, requireRoles(['admin', 'support'])],
    },
    async (request) => {
      const payload = extendSubscriptionSchema.parse(request.body);
      const auth = request.auth;
      const updated = app.store.extendSubscription(payload.user_id, payload.ends_at, auth?.userId ?? null);
      if (!updated) {
        throw new ApiError('NOT_FOUND', 'Подписка пользователя не найдена');
      }

      app.store.saveAudit({
        actorUserId: auth?.userId ?? null,
        actorRole: auth?.role ?? 'system',
        action: 'subscription.extend',
        entityType: 'subscription',
        entityId: updated.id,
        beforeState: null,
        afterState: {
          ends_at: updated.endsAt,
          status: updated.status,
        },
        requestId: request.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'] ?? null,
      });

      return success(request, {
        subscription_id: updated.id,
        user_id: updated.userId,
        ends_at: updated.endsAt,
        status: updated.status,
      });
    },
  );

  app.get('/admin/videos', adminGuard, async (request) => {
    return success(request, {
      videos: app.store.listVideos({ includeDrafts: true }).map((video) => ({
        id: video.id,
        kinescope_id: video.kinescopeId,
        title: video.title,
        description: video.description,
        category: video.category,
        access_level: video.accessLevel,
        duration_min: video.durationMin,
        published_at: video.publishedAt,
        status: video.status,
      })),
    });
  });

  app.post('/admin/videos', adminGuard, async (request, reply) => {
    const payload = videoUpsertSchema.parse(request.body);
    const now = new Date().toISOString();
    const video = app.store.upsertVideo({
      id: payload.id ?? randomUUID(),
      kinescopeId: payload.kinescope_id,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      accessLevel: payload.access_level,
      durationMin: payload.duration_min,
      status: payload.status,
      publishedAt: now,
    });

    reply.status(payload.id ? 200 : 201);
    return success(request, { video });
  });

  app.get('/admin/articles', adminGuard, async (request) => {
    return success(request, {
      articles: app.store.listArticles({ includeDrafts: true }).map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        access: article.access,
        published_at: article.publishedAt,
        status: article.status,
      })),
    });
  });

  app.post('/admin/articles', adminGuard, async (request, reply) => {
    const payload = articleUpsertSchema.parse(request.body);
    const now = new Date().toISOString();
    const article = app.store.upsertArticle({
      id: payload.id ?? randomUUID(),
      slug: payload.slug,
      title: payload.title,
      excerpt: payload.excerpt,
      body: payload.body,
      category: payload.category,
      access: payload.access,
      status: payload.status,
      publishedAt: now,
    });

    reply.status(payload.id ? 200 : 201);
    return success(request, { article });
  });

  app.get('/admin/zoom', adminGuard, async (request) => {
    const link = app.store.getActiveZoomLink('main');
    return success(request, {
      room: 'main',
      link: link
        ? {
            id: link.id,
            room: link.room,
            status: link.status,
            updated_at: link.updatedAt,
            target_url_masked: true,
          }
        : null,
    });
  });

  app.put(
    '/admin/zoom',
    {
      preHandler: [app.authenticate, requireRoles(['admin'])],
    },
    async (request) => {
      const payload = zoomUpsertSchema.parse(request.body);
      const link = app.store.upsertZoomLink(payload.room, payload.target_url, payload.status);
      const auth = request.auth;

      app.store.saveAudit({
        actorUserId: auth?.userId ?? null,
        actorRole: auth?.role ?? 'system',
        action: 'zoom.upsert',
        entityType: 'zoom_link',
        entityId: link.id,
        beforeState: null,
        afterState: {
          room: link.room,
          status: link.status,
        },
        requestId: request.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'] ?? null,
      });

      return success(request, {
        id: link.id,
        room: link.room,
        status: link.status,
        updated_at: link.updatedAt,
      });
    },
  );

  app.get('/admin/orders', adminGuard, async (request) => {
    return success(request, {
      orders: app.store.listOrders().map((order) => ({
        id: order.id,
        user_id: order.userId,
        plan_code: order.planCode,
        amount_rub: order.amountRub,
        status: order.status,
        provider_order_id: order.providerOrderId,
        created_at: order.createdAt,
      })),
    });
  });
};
