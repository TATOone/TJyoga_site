import { randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import { TextEncoder } from 'node:util';
import { env } from '../../config/env.js';
import { ApiError } from '../../lib/http.js';
import type { BackendStore } from '../../persistence/store.js';
import type { UserRecord } from '../../types/domain.js';

const ACCESS_TOKEN_TTL_SEC = 900;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const encoder = new TextEncoder();

const isSupabaseConfigured = (): boolean =>
  Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseHeaders = (): Record<string, string> => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY ?? '',
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY ?? ''}`,
  'Content-Type': 'application/json',
});

const issueLocalTokens = async (user: UserRecord): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresInSec: number;
}> => {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = await new SignJWT({
    role: user.role,
    app_metadata: {
      role: user.role,
    },
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.id)
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_TTL_SEC)
    .setIssuer(env.SUPABASE_JWT_ISSUER ?? 'tj-yoga-auth')
    .setAudience(env.SUPABASE_JWT_AUDIENCE ?? 'authenticated')
    .sign(encoder.encode(env.SUPABASE_JWT_SECRET));

  const refreshToken = randomUUID();

  return {
    accessToken,
    refreshToken,
    expiresInSec: ACCESS_TOKEN_TTL_SEC,
  };
};

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSec: number;
  user: {
    id: string;
    role: UserRecord['role'];
  };
}

export const registerUser = async (store: BackendStore, input: RegisterInput): Promise<{
  userId: string;
  role: UserRecord['role'];
  status: UserRecord['status'];
}> => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existingUser = store.getUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new ApiError('CONFLICT', 'Пользователь с таким email уже существует');
  }

  if (isSupabaseConfigured()) {
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({
        email: normalizedEmail,
        password: input.password,
        data: {
          first_name: input.firstName,
          phone: input.phone,
          role: 'student',
        },
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { msg?: string } | null;
      throw new ApiError('VALIDATION_ERROR', payload?.msg ?? 'Не удалось зарегистрировать пользователя');
    }

    const payload = (await response.json()) as { user?: { id?: string } };
    const userId = payload.user?.id;
    if (!userId) {
      throw new ApiError('INTERNAL_ERROR', 'Supabase не вернул user_id');
    }

    store.createUser({
      id: userId,
      email: normalizedEmail,
      role: 'student',
      status: 'active',
    });

    return {
      userId,
      role: 'student',
      status: 'active',
    };
  }

  const user = store.createUser({
    email: normalizedEmail,
    role: 'student',
    status: 'active',
  });

  await store.saveLocalCredentials(user.id, input.password);

  return {
    userId: user.id,
    role: user.role,
    status: user.status,
  };
};

export const loginUser = async (store: BackendStore, input: { email: string; password: string }): Promise<AuthTokens> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_ANON_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password: input.password,
      }),
    });

    if (!response.ok) {
      throw new ApiError('UNAUTHORIZED', 'Неверный email или пароль');
    }

    const payload = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user: { id: string };
    };

    const user = store.getUserById(payload.user.id) ?? store.createUser({
      id: payload.user.id,
      email: normalizedEmail,
      role: 'student',
      status: 'active',
    });

    store.saveRefreshToken({
      token: payload.refresh_token,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString(),
    });

    return {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresInSec: payload.expires_in,
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }

  const user = store.getUserByEmail(normalizedEmail);
  if (!user) {
    throw new ApiError('UNAUTHORIZED', 'Неверный email или пароль');
  }

  const credentialCheck = await store.verifyLocalCredentials(user.id, input.password);
  if (!credentialCheck.ok) {
    throw new ApiError('UNAUTHORIZED', 'Неверный email или пароль');
  }

  if (credentialCheck.needsRehash) {
    await store.rehashLocalCredentials(user.id, input.password);
  }

  const tokens = await issueLocalTokens(user);
  store.saveRefreshToken({
    token: tokens.refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString(),
  });

  return {
    ...tokens,
    user: {
      id: user.id,
      role: user.role,
    },
  };
};

export const refreshUserSession = async (
  store: BackendStore,
  refreshToken: string,
): Promise<AuthTokens> => {
  const storedToken = store.getRefreshToken(refreshToken);
  if (!storedToken || storedToken.revokedAt || Date.parse(storedToken.expiresAt) <= Date.now()) {
    throw new ApiError('UNAUTHORIZED', 'Refresh token невалиден или отозван');
  }

  const user = store.getUserById(storedToken.userId);
  if (!user) {
    throw new ApiError('UNAUTHORIZED', 'Пользователь не найден');
  }

  if (isSupabaseConfigured()) {
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_ANON_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new ApiError('UNAUTHORIZED', 'Refresh token невалиден или отозван');
    }

    const payload = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user: { id: string };
    };

    store.revokeRefreshToken(refreshToken);
    store.saveRefreshToken({
      token: payload.refresh_token,
      userId: payload.user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString(),
    });

    return {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresInSec: payload.expires_in,
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }

  store.revokeRefreshToken(refreshToken);
  const tokens = await issueLocalTokens(user);
  store.saveRefreshToken({
    token: tokens.refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString(),
  });

  return {
    ...tokens,
    user: {
      id: user.id,
      role: user.role,
    },
  };
};

export const logoutUser = (store: BackendStore, refreshToken: string): void => {
  const storedToken = store.getRefreshToken(refreshToken);
  if (!storedToken) {
    return;
  }

  store.revokeRefreshToken(refreshToken);
};
