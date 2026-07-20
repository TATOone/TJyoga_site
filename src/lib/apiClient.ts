import { API_BASE_URL } from '../config/api';
import {
  clearAuthSession,
  loadAuthSession,
  updateAuthSessionTokens,
} from './authStorage';

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface ApiEnvelope<T> {
  data: T;
  meta: {
    request_id: string;
  };
}

interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    request_id: string;
  };
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresInSec: number;
  user: {
    id: string;
    role: string;
  };
}

export interface CheckoutSessionResponse {
  order_id: string;
  status: 'pending_payment';
  payment_provider: 'prodamus';
  payment_url: string;
  expires_at: string;
}

export interface CheckoutOrderStatusResponse {
  order_id: string;
  status: string;
  plan_code: string;
  amount_rub: number;
  payment_provider: 'prodamus';
  payment_url: string | null;
  expires_at: string | null;
  subscription_status: string | null;
}

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

let refreshPromise: Promise<string | null> | null = null;

const requestRaw = async <T>(
  path: string,
  options: RequestInit & {
    accessToken?: string | null;
    skipAuthRefresh?: boolean;
  } = {},
): Promise<T> => {
  const headers = new Headers(options.headers ?? {});
  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    const errorPayload = payload as ApiErrorEnvelope | null;
    throw new ApiClientError(
      errorPayload?.error.code ?? 'INTERNAL_ERROR',
      errorPayload?.error.message ?? 'Ошибка API',
      response.status,
      errorPayload?.error.details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (payload as ApiEnvelope<T>).data;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const session = loadAuthSession();
    if (!session?.refreshToken) {
      return null;
    }

    try {
      const data = await requestRaw<{
        access_token: string;
        refresh_token: string;
        expires_in_sec: number;
      }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: session.refreshToken }),
        skipAuthRefresh: true,
      });

      updateAuthSessionTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresInSec: data.expires_in_sec,
      });

      return data.access_token;
    } catch {
      clearAuthSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const request = async <T>(
  path: string,
  options: RequestInit & {
    accessToken?: string | null;
    skipAuthRefresh?: boolean;
  } = {},
): Promise<T> => {
  try {
    return await requestRaw<T>(path, options);
  } catch (error) {
    if (
      !(error instanceof ApiClientError) ||
      error.status !== 401 ||
      options.skipAuthRefresh ||
      !options.accessToken
    ) {
      throw error;
    }

    const nextToken = await refreshAccessToken();
    if (!nextToken) {
      throw error;
    }

    return requestRaw<T>(path, {
      ...options,
      accessToken: nextToken,
      skipAuthRefresh: true,
    });
  }
};

export const apiClient = {
  register: (input: {
    email: string;
    password: string;
    first_name?: string;
    phone?: string;
  }) =>
    request<{ user_id: string; role: string; status: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
      skipAuthRefresh: true,
    }),

  login: async (input: { email: string; password: string }): Promise<AuthSession> => {
    const data = await request<{
      access_token: string;
      refresh_token: string;
      expires_in_sec: number;
      user: AuthSession['user'];
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
      skipAuthRefresh: true,
    });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresInSec: data.expires_in_sec,
      user: data.user,
    };
  },

  refresh: async (refreshToken: string): Promise<AuthSession> => {
    const data = await request<{
      access_token: string;
      refresh_token: string;
      expires_in_sec: number;
      user: AuthSession['user'];
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
      skipAuthRefresh: true,
    });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresInSec: data.expires_in_sec,
      user: data.user,
    };
  },

  logout: async (refreshToken: string): Promise<void> => {
    await request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
      skipAuthRefresh: true,
    });
  },

  createCheckoutSession: (
    input: {
      plan_code: string;
      return_url_success: string;
      return_url_error: string;
      accept_consents: Array<{ doc_type: string; version: string }>;
      customer_email?: string;
      customer_phone?: string;
      customer_extra?: string;
    },
    accessToken: string,
    idempotencyKey: string,
  ) =>
    request<CheckoutSessionResponse>('/checkout/session', {
      method: 'POST',
      body: JSON.stringify(input),
      accessToken,
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    }),

  getCheckoutOrder: (orderId: string, accessToken: string) =>
    request<CheckoutOrderStatusResponse>(`/checkout/orders/${orderId}`, {
      method: 'GET',
      accessToken,
    }),

  getMe: (accessToken: string) =>
    request<MeResponse>('/auth/me', {
      method: 'GET',
      accessToken,
    }),

  listVideos: (accessToken: string) =>
    request<{ videos: VideoListItem[] }>('/content/videos', {
      method: 'GET',
      accessToken,
    }),

  getVideo: (videoId: string, accessToken: string) =>
    request<VideoDetail>(`/content/videos/${videoId}`, {
      method: 'GET',
      accessToken,
    }),

  listArticles: (accessToken?: string | null) =>
    request<{ articles: ArticleListItem[] }>('/content/articles', {
      method: 'GET',
      accessToken: accessToken ?? undefined,
    }),

  getArticle: (slug: string, accessToken?: string | null) =>
    request<ArticleDetail>(`/content/articles/${slug}`, {
      method: 'GET',
      accessToken: accessToken ?? undefined,
    }),

  getAdminOverview: (accessToken: string) =>
    request<AdminOverview>('/admin/overview', {
      method: 'GET',
      accessToken,
    }),

  listAdminUsers: (accessToken: string) =>
    request<{ users: AdminUser[] }>('/admin/users', {
      method: 'GET',
      accessToken,
    }),

  listAdminVideos: (accessToken: string) =>
    request<{ videos: VideoListItem[] }>('/admin/videos', {
      method: 'GET',
      accessToken,
    }),

  upsertAdminVideo: (
    accessToken: string,
    input: {
      id?: string;
      kinescope_id: string;
      title: string;
      description?: string;
      category: string;
      access_level?: string;
      duration_min?: number;
      status?: string;
    },
  ) =>
    request<{ video: unknown }>('/admin/videos', {
      method: 'POST',
      accessToken,
      body: JSON.stringify(input),
    }),

  listAdminArticles: (accessToken: string) =>
    request<{ articles: ArticleListItem[] }>('/admin/articles', {
      method: 'GET',
      accessToken,
    }),

  upsertAdminArticle: (
    accessToken: string,
    input: {
      id?: string;
      slug: string;
      title: string;
      excerpt?: string;
      body: string;
      category: string;
      access: string;
      status?: string;
    },
  ) =>
    request<{ article: unknown }>('/admin/articles', {
      method: 'POST',
      accessToken,
      body: JSON.stringify(input),
    }),

  updateZoomLink: (
    accessToken: string,
    input: { room?: string; target_url: string; status?: string },
  ) =>
    request<{ id: string; room: string; status: string }>('/admin/zoom', {
      method: 'PUT',
      accessToken,
      body: JSON.stringify(input),
    }),

  extendSubscription: (accessToken: string, input: { user_id: string; ends_at: string }) =>
    request<{ subscription_id: string; ends_at: string; status: string }>(
      '/admin/subscriptions/extend',
      {
        method: 'POST',
        accessToken,
        body: JSON.stringify(input),
      },
    ),

  getZoomRedirect: (accessToken: string, room = 'main') =>
    request<{ allowed: boolean; room: string; redirect_url: string }>(
      `/access/zoom/${room}?format=json`,
      {
        method: 'GET',
        accessToken,
      },
    ),
};

export interface MeResponse {
  auth_source: string | null;
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
  } | null;
  subscription: {
    status: string;
    plan_code: string;
    ends_at: string;
    grace_ends_at: string | null;
  } | null;
  consents: unknown[];
}

export interface VideoListItem {
  id: string;
  kinescope_id: string;
  title: string;
  description: string;
  category: string;
  access_level: string;
  duration_min: number;
  published_at: string;
}

export interface VideoDetail extends VideoListItem {
  player: {
    mode: string;
    embed_base: string;
    auth_endpoint: string;
  };
}

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  access: string;
  published_at: string;
}

export interface ArticleDetail extends ArticleListItem {
  body: string;
  updated_at: string;
}

export interface AdminOverview {
  users_count: number;
  subscriptions_count: number;
  orders_count: number;
  payments_count: number;
  videos_count: number;
  articles_count: number;
  plans: Array<{ code: string; title: string; amountRub: number; durationDays: number }>;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: string;
  subscription: {
    status: string;
    plan_code: string;
    ends_at: string;
  } | null;
}
