import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { ApiError, success } from '../../lib/http.js';
import { requireRoles } from '../../security/rbac.js';
import { evaluateSubscriptionAccess } from '../subscriptions/access.js';

const articleSlugSchema = z.object({
  slug: z.string().min(1).max(200),
});

const videoIdSchema = z.object({
  videoId: z.string().min(1),
});

export const contentRoutes: FastifyPluginAsync = async (app) => {
  app.get('/content/articles', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const bypassHint =
      env.AUTH_DEV_BYPASS_ENABLED &&
      (typeof request.headers['x-user-id'] === 'string' ||
        typeof request.headers['x-user-role'] === 'string');
    let hasClubAccess = false;

    if (authHeader?.startsWith('Bearer ') || bypassHint) {
      try {
        await app.authenticate(request, reply);
        const auth = request.auth;
        if (auth) {
          const subscription = app.store.getSubscriptionByUserId(auth.userId);
          hasClubAccess = evaluateSubscriptionAccess(subscription, env.SUBSCRIPTION_GRACE_HOURS).allowed;
        }
      } catch {
        hasClubAccess = false;
      }
    }

    const articles = app.store
      .listArticles()
      .filter((article) => article.access === 'public' || hasClubAccess)
      .map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        access: article.access,
        published_at: article.publishedAt,
      }));

    return success(request, { articles });
  });

  app.get('/content/articles/:slug', async (request, reply) => {
    const params = articleSlugSchema.parse(request.params);
    const article = app.store.getArticleBySlug(params.slug);
    if (!article || article.status !== 'published') {
      throw new ApiError('NOT_FOUND', 'Статья не найдена');
    }

    if (article.access === 'club') {
      await app.authenticate(request, reply);
      const auth = request.auth;
      if (!auth) {
        throw new ApiError('UNAUTHORIZED', 'Требуется авторизация');
      }
      const subscription = app.store.getSubscriptionByUserId(auth.userId);
      const access = evaluateSubscriptionAccess(subscription, env.SUBSCRIPTION_GRACE_HOURS);
      if (!access.allowed) {
        throw new ApiError('SUBSCRIPTION_REQUIRED', 'Требуется активная подписка');
      }
    }

    return success(request, {
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      body: article.body,
      category: article.category,
      access: article.access,
      published_at: article.publishedAt,
      updated_at: article.updatedAt,
    });
  });

  app.get(
    '/content/videos',
    {
      preHandler: [app.authenticate, requireRoles(['user'])],
    },
    async (request) => {
      const auth = request.auth;
      if (!auth) {
        throw new ApiError('UNAUTHORIZED', 'Требуется авторизация');
      }

      const subscription = app.store.getSubscriptionByUserId(auth.userId);
      const access = evaluateSubscriptionAccess(subscription, env.SUBSCRIPTION_GRACE_HOURS);
      if (!access.allowed) {
        throw new ApiError('SUBSCRIPTION_REQUIRED', 'Требуется активная подписка');
      }

      const videos = app.store.listVideos().map((video) => ({
        id: video.id,
        kinescope_id: video.kinescopeId,
        title: video.title,
        description: video.description,
        category: video.category,
        access_level: video.accessLevel,
        duration_min: video.durationMin,
        published_at: video.publishedAt,
      }));

      return success(request, { videos });
    },
  );

  app.get(
    '/content/videos/:videoId',
    {
      preHandler: [app.authenticate, requireRoles(['user'])],
    },
    async (request) => {
      const auth = request.auth;
      if (!auth) {
        throw new ApiError('UNAUTHORIZED', 'Требуется авторизация');
      }

      const params = videoIdSchema.parse(request.params);
      const video = app.store.getVideoById(params.videoId);
      if (!video || video.status !== 'published') {
        throw new ApiError('NOT_FOUND', 'Видео не найдено');
      }

      if (video.accessLevel === 'club_active') {
        const subscription = app.store.getSubscriptionByUserId(auth.userId);
        const access = evaluateSubscriptionAccess(subscription, env.SUBSCRIPTION_GRACE_HOURS);
        if (!access.allowed) {
          throw new ApiError('SUBSCRIPTION_REQUIRED', 'Требуется активная подписка');
        }
      }

      return success(request, {
        id: video.id,
        kinescope_id: video.kinescopeId,
        title: video.title,
        description: video.description,
        category: video.category,
        access_level: video.accessLevel,
        duration_min: video.durationMin,
        published_at: video.publishedAt,
        player: {
          mode: 'iframe',
          embed_base: 'https://kinescope.io/embed/',
          auth_endpoint: '/api/v1/integrations/kinescope/auth',
        },
      });
    },
  );
};
