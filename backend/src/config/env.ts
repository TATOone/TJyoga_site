import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(8787),
  API_PREFIX: z.string().default('/api/v1'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  APP_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),

  AUTH_DEV_BYPASS_ENABLED: z.coerce.boolean().default(false),
  DEV_DEFAULT_USER_ID: z.string().default('00000000-0000-4000-8000-000000000002'),
  DEV_DEFAULT_USER_ROLE: z.enum(['user', 'student', 'support', 'editor', 'admin']).default('student'),

  SUPABASE_JWT_SECRET: z.string().default('dev-only-supabase-jwt-secret'),
  SUPABASE_JWT_ISSUER: z.string().optional(),
  SUPABASE_JWT_AUDIENCE: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  PRODMODE: z.coerce.boolean().default(false),
  PRODAMUS_WEBHOOK_SECRET: z.string().default('dev-prodamus-webhook-secret'),
  PRODAMUS_SIGNATURE_HEADER: z.string().default('x-prodamus-signature'),
  PRODAMUS_SIGNATURE_ALGO: z.enum(['sha256']).default('sha256'),
  PRODAMUS_MODE: z.enum(['test', 'live']).default('test'),
  PRODAMUS_STUB_ENABLED: z.coerce.boolean().default(true),
  PRODAMUS_PAYFORM_URL: z.string().url().default('https://payform.ru/t5a23mO/'),
  PRODAMUS_PAYFORM_SECRET: z.string().optional(),
  PRODAMUS_SYS_CODE: z.string().optional(),
  PRODAMUS_API_KEY_TEST: z.string().optional(),
  PRODAMUS_API_KEY_LIVE: z.string().optional(),

  DATABASE_URL: z.string().optional(),

  KINESCOPE_AUTH_SECRET: z.string().default('dev-kinescope-auth-secret'),
  ZOOM_REDIRECT_ENCRYPTION_KEY: z.string().default('dev-zoom-encryption-key-32-chars'),
  ZOOM_ROOM_MAIN_URL: z.string().url().default('https://zoom.us/j/123456789?pwd=replace-me'),

  SUBSCRIPTION_GRACE_HOURS: z.coerce.number().int().min(1).default(72),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse(process.env);

export const allowedOrigins = env.APP_ALLOWED_ORIGINS.split(',')
  .map((value) => value.trim())
  .filter(Boolean);

/** Запрещает небезопасную конфигурацию auth в production. */
export const assertSecureEnvironment = (): void => {
  if (env.NODE_ENV === 'production' && env.AUTH_DEV_BYPASS_ENABLED) {
    throw new Error(
      'AUTH_DEV_BYPASS_ENABLED запрещён в production. Отключите bypass и используйте Supabase JWT.',
    );
  }
};
