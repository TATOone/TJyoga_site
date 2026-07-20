import { TextEncoder } from 'node:util';
import { jwtVerify } from 'jose';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { env } from '../config/env.js';
import { ApiError } from '../lib/http.js';
import { USER_ROLES, type UserRole } from '../types/domain.js';

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);

const readRoleFromTokenPayload = (payload: Record<string, unknown>): UserRole => {
  const roleFromRoot = payload.role;
  if (isUserRole(roleFromRoot)) {
    return roleFromRoot;
  }

  const appMetadata = payload.app_metadata;
  if (typeof appMetadata === 'object' && appMetadata !== null && 'role' in appMetadata) {
    const maybeRole = (appMetadata as Record<string, unknown>).role;
    if (isUserRole(maybeRole)) {
      return maybeRole;
    }
  }

  return 'student';
};

const authPluginImpl: FastifyPluginAsync = async (app) => {
  app.decorateRequest('auth', null);

  app.decorate('authenticate', async (request) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (!env.AUTH_DEV_BYPASS_ENABLED) {
        throw new ApiError('UNAUTHORIZED', 'Отсутствует Bearer токен');
      }

      const bypassUserIdHeader = request.headers['x-user-id'];
      const bypassRoleHeader = request.headers['x-user-role'];

      const userId = typeof bypassUserIdHeader === 'string' ? bypassUserIdHeader : env.DEV_DEFAULT_USER_ID;
      const roleCandidate =
        typeof bypassRoleHeader === 'string' && isUserRole(bypassRoleHeader)
          ? bypassRoleHeader
          : env.DEV_DEFAULT_USER_ROLE;

      request.auth = {
        userId,
        role: roleCandidate,
        source: 'dev_bypass',
      };
      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new ApiError('UNAUTHORIZED', 'Пустой Bearer токен');
    }

    try {
      const verificationResult = await jwtVerify(token, new TextEncoder().encode(env.SUPABASE_JWT_SECRET), {
        issuer: env.SUPABASE_JWT_ISSUER,
        audience: env.SUPABASE_JWT_AUDIENCE,
      });

      const payload = verificationResult.payload as Record<string, unknown>;
      const userId = payload.sub;
      if (typeof userId !== 'string' || userId.length === 0) {
        throw new ApiError('UNAUTHORIZED', 'JWT не содержит sub');
      }

      request.auth = {
        userId,
        role: readRoleFromTokenPayload(payload),
        source: 'supabase_jwt',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('UNAUTHORIZED', 'JWT невалиден');
    }
  });
};

export const authPlugin = fp(authPluginImpl, {
  name: 'auth-plugin',
});
