import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import rawBody from 'fastify-raw-body';
import { allowedOrigins, assertSecureEnvironment, env } from './config/env.js';
import { loggerOptions } from './config/logger.js';
import { ApiError, ensureRequestId, mapUnknownError, toErrorResponse } from './lib/http.js';
import { healthRoutes } from './modules/health/routes.js';
import { buildStore } from './persistence/factory.js';
import type { BackendStore } from './persistence/store.js';
import { apiV1Routes } from './routes/v1.js';
import { authPlugin } from './security/auth.js';

interface BuildAppOptions {
  store?: BackendStore;
}

export const buildApp = async (options: BuildAppOptions = {}): Promise<FastifyInstance> => {
  assertSecureEnvironment();

  const app = Fastify({
    logger: loggerOptions,
    trustProxy: true,
    genReqId: (request) => ensureRequestId(request.headers['x-request-id'] as string | undefined),
  });

  app.decorate('store', options.store ?? (await buildStore()));

  await app.register(rawBody, {
    field: 'rawBody',
    encoding: 'utf8',
    global: false,
    runFirst: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new ApiError('FORBIDDEN', 'CORS origin запрещен', { origin }), false);
    },
  });

  await app.register(rateLimit, {
    max: 250,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
  });

  await app.register(authPlugin);

  app.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  app.setErrorHandler((error, request, reply) => {
    const mappedError = mapUnknownError(error);

    if (mappedError.code === 'INTERNAL_ERROR') {
      request.log.error(
        {
          error,
          request_id: request.id,
        },
        'Unhandled application error',
      );
    } else {
      request.log.warn(
        {
          code: mappedError.code,
          message: mappedError.message,
          details: mappedError.details,
          request_id: request.id,
        },
        'Handled API error',
      );
    }

    reply.status(mappedError.statusCode).send(toErrorResponse(request, mappedError));
  });

  await app.register(healthRoutes);
  await app.register(apiV1Routes, {
    prefix: env.API_PREFIX,
  });

  app.get('/api/v1', async (request) => ({
    data: {
      service: 'tj-yoga-backend-foundation',
      version: 'v1',
      request_example_idempotency_key: randomUUID(),
    },
    meta: {
      request_id: request.id,
    },
  }));

  return app;
};
