import type { FastifyServerOptions } from 'fastify';
import { env } from './env.js';

export const loggerOptions: FastifyServerOptions['logger'] =
  env.NODE_ENV === 'development'
    ? {
        level: env.LOG_LEVEL,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        level: env.LOG_LEVEL,
      };
