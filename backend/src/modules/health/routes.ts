import type { FastifyPluginAsync } from 'fastify';
import { success } from '../../lib/http.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (request) =>
    success(request, {
      status: 'ok',
      service: 'tj-yoga-backend-foundation',
      timestamp: new Date().toISOString(),
      uptime_sec: Math.round(process.uptime()),
    }),
  );
};
