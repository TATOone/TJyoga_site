import type { FastifyPluginAsync } from 'fastify';
import { success } from '../../lib/http.js';
import { requireRoles } from '../../security/rbac.js';
import {
  loginRequestSchema,
  logoutRequestSchema,
  refreshRequestSchema,
  registerRequestSchema,
} from './schema.js';
import { loginUser, logoutUser, refreshUserSession, registerUser } from './service.js';

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/auth/register', async (request, reply) => {
    const payload = registerRequestSchema.parse(request.body);
    const data = await registerUser(app.store, {
      email: payload.email,
      password: payload.password,
      firstName: payload.first_name,
      phone: payload.phone,
    });

    reply.status(201);
    return success(request, {
      user_id: data.userId,
      role: data.role,
      status: data.status,
    });
  });

  app.post('/auth/login', async (request) => {
    const payload = loginRequestSchema.parse(request.body);
    const data = await loginUser(app.store, payload);

    return success(request, {
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
      expires_in_sec: data.expiresInSec,
      user: data.user,
    });
  });

  app.post('/auth/refresh', async (request) => {
    const payload = refreshRequestSchema.parse(request.body);
    const data = await refreshUserSession(app.store, payload.refresh_token);

    return success(request, {
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
      expires_in_sec: data.expiresInSec,
      user: data.user,
    });
  });

  app.post('/auth/logout', async (request, reply) => {
    const payload = logoutRequestSchema.parse(request.body);
    logoutUser(app.store, payload.refresh_token);
    return reply.status(204).send();
  });

  app.get(
    '/auth/me',
    {
      preHandler: [app.authenticate, requireRoles(['user'])],
    },
    async (request) => {
      const auth = request.auth;
      const user = auth ? app.store.getUserById(auth.userId) : null;
      const subscription = auth ? app.store.getSubscriptionByUserId(auth.userId) : null;

      return success(request, {
        auth_source: auth?.source ?? null,
        user: user
          ? {
              id: user.id,
              email: user.email,
              role: user.role,
              status: user.status,
            }
          : null,
        subscription: subscription
          ? {
              status: subscription.status,
              plan_code: subscription.planCode,
              ends_at: subscription.endsAt,
              grace_ends_at: subscription.graceEndsAt,
            }
          : null,
        consents: auth ? app.store.getConsentByUserId(auth.userId) : [],
      });
    },
  );

  app.get(
    '/admin/foundation/ping',
    {
      preHandler: [app.authenticate, requireRoles(['admin'])],
    },
    async (request) =>
      success(request, {
        ok: true,
        scope: 'admin',
      }),
  );
};
