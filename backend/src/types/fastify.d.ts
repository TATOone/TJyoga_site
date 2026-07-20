import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthContext } from './auth.js';
import type { BackendStore } from '../persistence/store.js';

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthContext | null;
    rawBody?: string;
  }

  interface FastifyInstance {
    store: BackendStore;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
