import { createHmac } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

const PRODMUS_SECRET = 'dev-prodamus-webhook-secret';
const KINESCOPE_SECRET = 'dev-kinescope-auth-secret';
const DEMO_STUDENT_ID = '00000000-0000-4000-8000-000000000002';
const DEMO_ADMIN_ID = '00000000-0000-4000-8000-000000000001';

const signPayload = (payload: string): string => createHmac('sha256', PRODMUS_SECRET).update(payload).digest('hex');

describe('Stage 3 foundation endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns health response', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        'x-request-id': 'health-test-request',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.status).toBe('ok');
    expect(body.meta.request_id).toBe('health-test-request');
  });

  it('rejects webhook with invalid signature', async () => {
    const payload = JSON.stringify({
      provider_payment_id: 'pdm_invalid',
      provider_order_id: 'order_abc',
      status: 'paid',
      amount_rub: 600000,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/prodamus/webhook',
      payload,
      headers: {
        'content-type': 'application/json',
        'x-prodamus-signature': 'invalid-signature',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('SIGNATURE_INVALID');
  });

  it('accepts webhook and safely handles duplicate event', async () => {
    const payload = JSON.stringify({
      provider_payment_id: 'pdm_12345',
      provider_order_id: 'order_abc',
      status: 'paid',
      amount_rub: 600000,
      paid_at: new Date().toISOString(),
      raw: {
        event_id: 'evt_stage3_1',
      },
    });
    const signature = signPayload(payload);

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/prodamus/webhook',
      payload,
      headers: {
        'content-type': 'application/json',
        'x-prodamus-signature': signature,
      },
    });
    expect(firstResponse.statusCode).toBe(200);
    expect(firstResponse.json().data.duplicate).toBe(false);

    const duplicateResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/prodamus/webhook',
      payload,
      headers: {
        'content-type': 'application/json',
        'x-prodamus-signature': signature,
      },
    });
    expect(duplicateResponse.statusCode).toBe(200);
    expect(duplicateResponse.json().data.duplicate).toBe(true);
  });

  it('allows kinescope auth for active subscription', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/integrations/kinescope/auth',
      headers: {
        'content-type': 'application/json',
        'x-kinescope-secret': KINESCOPE_SECRET,
        'x-user-id': DEMO_STUDENT_ID,
        'x-user-role': 'student',
      },
      payload: {
        user_id: DEMO_STUDENT_ID,
        video_id: 'video_1',
        video_access_level: 'club_active',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.decision).toBe('allow');
  });

  it('rejects kinescope auth when payload user_id does not match session', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/integrations/kinescope/auth',
      headers: {
        'content-type': 'application/json',
        'x-kinescope-secret': KINESCOPE_SECRET,
        'x-user-id': DEMO_STUDENT_ID,
        'x-user-role': 'student',
      },
      payload: {
        user_id: '00000000-0000-4000-8000-000000009999',
        video_id: 'video_1',
        video_access_level: 'club_active',
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.details?.code).toBe('USER_ID_MISMATCH');
  });

  it('denies kinescope auth when user lacks subscription', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/integrations/kinescope/auth',
      headers: {
        'content-type': 'application/json',
        'x-kinescope-secret': KINESCOPE_SECRET,
        'x-user-id': DEMO_ADMIN_ID,
        'x-user-role': 'admin',
      },
      payload: {
        user_id: DEMO_ADMIN_ID,
        video_id: 'video_1',
        video_access_level: 'club_active',
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('SUBSCRIPTION_REQUIRED');
  });

  it('fails startup guard when dev bypass is enabled in production', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousBypass = process.env.AUTH_DEV_BYPASS_ENABLED;
    process.env.NODE_ENV = 'production';
    process.env.AUTH_DEV_BYPASS_ENABLED = 'true';
    vi.resetModules();

    const { assertSecureEnvironment: guard } = await import('../src/config/env.js');
    expect(() => guard()).toThrow(/AUTH_DEV_BYPASS_ENABLED/);

    process.env.NODE_ENV = previousNodeEnv;
    process.env.AUTH_DEV_BYPASS_ENABLED = previousBypass;
    vi.resetModules();
  });

  it('redirects to zoom room for active subscription', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/access/zoom/main',
      headers: {
        'x-user-id': DEMO_STUDENT_ID,
        'x-user-role': 'student',
      },
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toContain('zoom.us');
  });

  it('returns 403 for zoom redirect without subscription', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/access/zoom/main',
      headers: {
        'x-user-id': '00000000-0000-4000-8000-000000009998',
        'x-user-role': 'student',
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('SUBSCRIPTION_REQUIRED');
  });

  it('enforces admin guard for foundation endpoint', async () => {
    const deniedResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/foundation/ping',
      headers: {
        'x-user-id': DEMO_STUDENT_ID,
        'x-user-role': 'student',
      },
    });
    expect(deniedResponse.statusCode).toBe(403);

    const allowedResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/foundation/ping',
      headers: {
        'x-user-id': DEMO_ADMIN_ID,
        'x-user-role': 'admin',
      },
    });
    expect(allowedResponse.statusCode).toBe(200);
    expect(allowedResponse.json().data.scope).toBe('admin');
  });
});
