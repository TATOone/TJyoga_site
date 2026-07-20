import type { FastifyPluginAsync } from 'fastify';
import { authRoutes } from '../modules/auth/routes.js';
import { adminRoutes } from '../modules/admin/routes.js';
import { checkoutRoutes } from '../modules/checkout/routes.js';
import { contentRoutes } from '../modules/content/routes.js';
import { kinescopeRoutes } from '../modules/integrations/kinescope/routes.js';
import { zoomAccessRoutes } from '../modules/access/zoom/routes.js';
import { prodamusRoutes } from '../modules/payments/prodamus/routes.js';

export const apiV1Routes: FastifyPluginAsync = async (app) => {
  await app.register(authRoutes);
  await app.register(checkoutRoutes);
  await app.register(prodamusRoutes);
  await app.register(kinescopeRoutes);
  await app.register(zoomAccessRoutes);
  await app.register(contentRoutes);
  await app.register(adminRoutes);
};
