import { z } from 'zod';

/** dotenv flags are strings; z.coerce.boolean() treats "false" as true. */
export const envBoolean = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
    return value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off', ''].includes(normalized)) {
    return false;
  }
  return value;
}, z.boolean());

export const DEV_DEFAULT_JWT_SECRET = 'dev-only-supabase-jwt-secret';
export const DEV_DEFAULT_WEBHOOK_SECRET = 'dev-prodamus-webhook-secret';
export const DEV_DEFAULT_KINESCOPE_SECRET = 'dev-kinescope-auth-secret';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(8787),
  API_PREFIX: z.string().default('/api/v1'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  APP_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),

  AUTH_DEV_BYPASS_ENABLED: envBoolean.default(false),
  DEV_DEFAULT_USER_ID: z.string().default('00000000-0000-4000-8000-000000000002'),
  DEV_DEFAULT_USER_ROLE: z.enum(['user', 'student', 'support', 'editor', 'admin']).default('student'),

  SUPABASE_JWT_SECRET: z.string().default(DEV_DEFAULT_JWT_SECRET),
  SUPABASE_JWT_ISSUER: z.string().optional(),
  SUPABASE_JWT_AUDIENCE: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  PRODAMUS_WEBHOOK_SECRET: z.string().default(DEV_DEFAULT_WEBHOOK_SECRET),
  PRODAMUS_SIGNATURE_HEADER: z.string().default('x-prodamus-signature'),
  PRODAMUS_SIGNATURE_ALGO: z.enum(['sha256']).default('sha256'),
  PRODAMUS_MODE: z.enum(['test', 'live']).default('test'),
  PRODAMUS_STUB_ENABLED: envBoolean.default(false),
  PRODAMUS_PAYFORM_URL: z.string().url().default('https://payform.ru/t5a23mO/'),
  PRODAMUS_PAYFORM_SECRET: z.string().optional(),
  PRODAMUS_SYS_CODE: z.string().optional(),
  PRODAMUS_API_KEY_TEST: z.string().optional(),
  PRODAMUS_API_KEY_LIVE: z.string().optional(),

  DATABASE_URL: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),

  // 1.5GiB VPS: keep the Node pool tiny. Postgres max_connections=100 is not free headroom.
  PG_POOL_MAX: z.coerce.number().int().min(1).max(20).default(4),
  PG_IDLE_TIMEOUT_MS: z.coerce.number().int().min(1000).default(10_000),
  PG_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(500).default(5_000),
  PG_STATEMENT_TIMEOUT_MS: z.coerce.number().int().min(0).default(5_000),

  KINESCOPE_AUTH_SECRET: z.string().default(DEV_DEFAULT_KINESCOPE_SECRET),
  ZOOM_ROOM_MAIN_URL: z.string().url().default('https://zoom.us/j/123456789?pwd=replace-me'),

  SUBSCRIPTION_GRACE_HOURS: z.coerce.number().int().min(1).default(72),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse(process.env);

export const allowedOrigins = env.APP_ALLOWED_ORIGINS.split(',')
  .map((value) => value.trim())
  .filter(Boolean);

export const PUBLIC_SITE_ORIGINS = ['https://tjyoga.ru', 'https://www.tjyoga.ru'] as const;

const isWeakOrDefaultSecret = (value: string | undefined, defaults: readonly string[]): boolean => {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length < 24) {
    return true;
  }
  return defaults.includes(trimmed);
};

/** Запрещает небезопасную конфигурацию в production. */
export const assertSecureEnvironment = (): string[] => {
  const warnings: string[] = [];

  if (env.NODE_ENV !== 'production') {
    return warnings;
  }

  if (env.AUTH_DEV_BYPASS_ENABLED) {
    throw new Error(
      'AUTH_DEV_BYPASS_ENABLED запрещён в production. Отключите bypass и используйте Supabase JWT.',
    );
  }

  if (!env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL обязателен в production. In-memory store остаётся только для local/dev/tests.',
    );
  }

  if (env.PRODAMUS_STUB_ENABLED) {
    throw new Error(
      'PRODAMUS_STUB_ENABLED запрещён в production. Выключите stub, иначе checkout отдаст тестовые ссылки.',
    );
  }

  if (isWeakOrDefaultSecret(env.SUPABASE_JWT_SECRET, [DEV_DEFAULT_JWT_SECRET])) {
    throw new Error(
      'SUPABASE_JWT_SECRET в production должен быть задан и не равен dev-default.',
    );
  }

  if (isWeakOrDefaultSecret(env.KINESCOPE_AUTH_SECRET, [DEV_DEFAULT_KINESCOPE_SECRET])) {
    throw new Error(
      'KINESCOPE_AUTH_SECRET в production должен быть задан и не равен dev-default.',
    );
  }

  if (isWeakOrDefaultSecret(env.PRODAMUS_WEBHOOK_SECRET, [DEV_DEFAULT_WEBHOOK_SECRET])) {
    const message =
      'WARNING: PRODAMUS_WEBHOOK_SECRET в production выглядит как dev-default или слишком короткий. Webhook подпись ненадёжна. Задайте боевой секрет платежной страницы и не перезатирайте текущий ключ без сверки с Prodamus.';
    warnings.push(message);
    console.warn(message);
  }

  return warnings;
};
