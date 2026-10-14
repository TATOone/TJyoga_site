import type { FastifyPluginAsync } from 'fastify';
import { success } from '../../lib/http.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (request, reply) => {
    const health = await app.store.healthCheck();
    let database: 'up' | 'down' | 'n/a';
    switch (app.store.kind) {
      case 'postgres':
        database = health.ok ? 'up' : 'down';
        break;
      case 'memory':
        database = 'n/a';
        break;
      default: {
        const unexpected: never = app.store.kind;
        throw new Error(`Unknown store kind: ${String(unexpected)}`);
      }
    }

    const payload = success(request, {
      status: health.ok ? 'ok' : 'error',
      service: 'tj-yoga-backend-foundation',
      timestamp: new Date().toISOString(),
      uptime_sec: Math.round(process.uptime()),
      store: app.store.kind,
      database,
    });

    if (!health.ok) {
      reply.code(503);
    }

    return payload;
  });
};
