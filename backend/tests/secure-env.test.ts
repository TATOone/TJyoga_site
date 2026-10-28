import { afterEach, describe, expect, it, vi } from 'vitest';

const snapshotEnv = () => ({ ...process.env });

const restoreEnv = (previous: NodeJS.ProcessEnv) => {
  for (const key of Object.keys(process.env)) {
    if (!(key in previous)) {
      delete process.env[key];
    }
  }
  Object.assign(process.env, previous);
};

describe('assertSecureEnvironment', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('refuses production when payment stub is enabled', async () => {
    const previous = snapshotEnv();
    process.env.NODE_ENV = 'production';
    process.env.AUTH_DEV_BYPASS_ENABLED = 'false';
    process.env.DATABASE_URL = 'postgres://tjyoga:tjyoga@127.0.0.1:5432/tjyoga';
    process.env.PRODAMUS_STUB_ENABLED = 'true';
    process.env.SUPABASE_JWT_SECRET = 'production-jwt-secret-value-32chars';
    process.env.KINESCOPE_AUTH_SECRET = 'production-kinescope-secret-32ch';
    process.env.PRODAMUS_WEBHOOK_SECRET = 'production-webhook-secret-32chars';
    vi.resetModules();

    const { assertSecureEnvironment } = await import('../src/config/env.js');
    expect(() => assertSecureEnvironment()).toThrow(/PRODAMUS_STUB_ENABLED/);
    restoreEnv(previous);
  });

  it('refuses production when JWT secret is the dev default', async () => {
    const previous = snapshotEnv();
    process.env.NODE_ENV = 'production';
    process.env.AUTH_DEV_BYPASS_ENABLED = 'false';
    process.env.DATABASE_URL = 'postgres://tjyoga:tjyoga@127.0.0.1:5432/tjyoga';
    process.env.PRODAMUS_STUB_ENABLED = 'false';
    process.env.SUPABASE_JWT_SECRET = 'dev-only-supabase-jwt-secret';
    process.env.KINESCOPE_AUTH_SECRET = 'production-kinescope-secret-32ch';
    process.env.PRODAMUS_WEBHOOK_SECRET = 'production-webhook-secret-32chars';
    vi.resetModules();

    const { assertSecureEnvironment } = await import('../src/config/env.js');
    expect(() => assertSecureEnvironment()).toThrow(/SUPABASE_JWT_SECRET/);
    restoreEnv(previous);
  });

  it('refuses production when Kinescope secret is the dev default', async () => {
    const previous = snapshotEnv();
    process.env.NODE_ENV = 'production';
    process.env.AUTH_DEV_BYPASS_ENABLED = 'false';
    process.env.DATABASE_URL = 'postgres://tjyoga:tjyoga@127.0.0.1:5432/tjyoga';
    process.env.PRODAMUS_STUB_ENABLED = 'false';
    process.env.SUPABASE_JWT_SECRET = 'production-jwt-secret-value-32chars';
    process.env.KINESCOPE_AUTH_SECRET = 'dev-kinescope-auth-secret';
    process.env.PRODAMUS_WEBHOOK_SECRET = 'production-webhook-secret-32chars';
    vi.resetModules();

    const { assertSecureEnvironment } = await import('../src/config/env.js');
    expect(() => assertSecureEnvironment()).toThrow(/KINESCOPE_AUTH_SECRET/);
    restoreEnv(previous);
  });

  it('warns but does not throw when webhook secret is the dev default', async () => {
    const previous = snapshotEnv();
    process.env.NODE_ENV = 'production';
    process.env.AUTH_DEV_BYPASS_ENABLED = 'false';
    process.env.DATABASE_URL = 'postgres://tjyoga:tjyoga@127.0.0.1:5432/tjyoga';
    process.env.PRODAMUS_STUB_ENABLED = 'false';
    process.env.SUPABASE_JWT_SECRET = 'production-jwt-secret-value-32chars';
    process.env.KINESCOPE_AUTH_SECRET = 'production-kinescope-secret-32ch';
    process.env.PRODAMUS_WEBHOOK_SECRET = 'dev-prodamus-webhook-secret';
    vi.resetModules();

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { assertSecureEnvironment } = await import('../src/config/env.js');
    const warnings = assertSecureEnvironment();
    expect(warnings.some((item) => item.includes('PRODAMUS_WEBHOOK_SECRET'))).toBe(true);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    restoreEnv(previous);
  });
});
