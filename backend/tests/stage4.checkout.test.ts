import { createHmac, randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import { TextEncoder } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

const PRODMUS_SECRET = 'dev-prodamus-webhook-secret';
const JWT_SECRET = 'dev-only-supabase-jwt-secret';

const signPayload = (payload: string): string => createHmac('sha256', PRODMUS_SECRET).update(payload).digest('hex');

const issueAccessToken = async (userId: string, role = 'student'): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ role, app_metadata: { role } })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(now + 900)
    .setIssuer('tj-yoga-auth')
    .setAudience('authenticated')
    .sign(new TextEncoder().encode(JWT_SECRET));
};

describe('Stage 4 checkout and auth', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.PRODAMUS_STUB_ENABLED = 'true';
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers and logs in a local user', async () => {
    const email = `stage4-${randomUUID()}@example.com`;

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email,
        password: 'StrongPass!23',
        first_name: 'Stage4',
      },
    });

    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.json().data.role).toBe('student');

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email,
        password: 'StrongPass!23',
      },
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.json().data.access_token).toBeTruthy();
    expect(loginResponse.json().data.refresh_token).toBeTruthy();
  });

  it('creates checkout session with idempotency replay', async () => {
    const email = `checkout-${randomUUID()}@example.com`;
    const password = 'StrongPass!23';

    await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email, password },
    });

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email, password },
    });

    const accessToken = loginResponse.json().data.access_token as string;
    const idempotencyKey = randomUUID();
    const payload = {
      plan_code: 'club-month',
      return_url_success: 'http://localhost:5173/payment/success',
      return_url_error: 'http://localhost:5173/payment/error',
      accept_consents: [
        { doc_type: 'offer', version: '1.0.0' },
        { doc_type: 'privacy', version: '1.0.0' },
        { doc_type: 'medical_disclaimer', version: '1.0.0' },
      ],
      customer_email: email,
    };

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout/session',
      payload,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'idempotency-key': idempotencyKey,
      },
    });

    expect(firstResponse.statusCode).toBe(201);
    const firstBody = firstResponse.json().data;
    expect(firstBody.payment_provider).toBe('prodamus');
    expect(firstBody.payment_url).toContain('http');

    const replayResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout/session',
      payload,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'idempotency-key': idempotencyKey,
      },
    });

    expect(replayResponse.statusCode).toBe(201);
    expect(replayResponse.json().data.order_id).toBe(firstBody.order_id);
  });

  it('returns idempotency conflict for same key with different body', async () => {
    const userId = randomUUID();
    const accessToken = await issueAccessToken(userId);
    app.store.createUser({
      id: userId,
      email: `conflict-${randomUUID()}@example.com`,
      role: 'student',
      status: 'active',
    });

    const idempotencyKey = randomUUID();
    const baseHeaders = {
      authorization: `Bearer ${accessToken}`,
      'idempotency-key': idempotencyKey,
    };

    await app.inject({
      method: 'POST',
      url: '/api/v1/checkout/session',
      payload: {
        plan_code: 'club-month',
        return_url_success: 'http://localhost:5173/payment/success',
        return_url_error: 'http://localhost:5173/payment/error',
        accept_consents: [
          { doc_type: 'offer', version: '1.0.0' },
          { doc_type: 'privacy', version: '1.0.0' },
          { doc_type: 'medical_disclaimer', version: '1.0.0' },
        ],
      },
      headers: baseHeaders,
    });

    const conflictResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout/session',
      payload: {
        plan_code: 'club-year',
        return_url_success: 'http://localhost:5173/payment/success',
        return_url_error: 'http://localhost:5173/payment/error',
        accept_consents: [
          { doc_type: 'offer', version: '1.0.0' },
          { doc_type: 'privacy', version: '1.0.0' },
          { doc_type: 'medical_disclaimer', version: '1.0.0' },
        ],
      },
      headers: baseHeaders,
    });

    expect(conflictResponse.statusCode).toBe(409);
    expect(conflictResponse.json().error.code).toBe('IDEMPOTENCY_CONFLICT');
  });

  it('activates subscription from paid webhook for checkout order', async () => {
    const email = `paid-${randomUUID()}@example.com`;
    const password = 'StrongPass!23';

    await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email, password },
    });

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email, password },
    });
    const accessToken = loginResponse.json().data.access_token as string;

    const checkoutResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout/session',
      payload: {
        plan_code: 'club-monthly',
        return_url_success: 'http://localhost:5173/payment/success',
        return_url_error: 'http://localhost:5173/payment/error',
        accept_consents: [
          { doc_type: 'offer', version: '1.0.0' },
          { doc_type: 'privacy', version: '1.0.0' },
          { doc_type: 'medical_disclaimer', version: '1.0.0' },
        ],
        customer_email: email,
      },
      headers: {
        authorization: `Bearer ${accessToken}`,
        'idempotency-key': randomUUID(),
      },
    });

    const orderId = checkoutResponse.json().data.order_id as string;
    const order = app.store.getOrderById(orderId);
    expect(order?.providerOrderId).toBeTruthy();

    const webhookPayload = JSON.stringify({
      provider_payment_id: `pdm_${randomUUID()}`,
      provider_order_id: order?.providerOrderId,
      status: 'paid',
      amount_rub: 600000,
      paid_at: '2026-06-11T21:40:00Z',
      raw: {
        event_id: `evt_${randomUUID()}`,
      },
    });

    const webhookResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/prodamus/webhook',
      payload: webhookPayload,
      headers: {
        'content-type': 'application/json',
        'x-prodamus-signature': signPayload(webhookPayload),
      },
    });

    expect(webhookResponse.statusCode).toBe(200);

    const orderStatusResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/checkout/orders/${orderId}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(orderStatusResponse.statusCode).toBe(200);
    expect(orderStatusResponse.json().data.status).toBe('paid');
    expect(orderStatusResponse.json().data.subscription_status).toBe('active');
  });

  it('refreshes and logs out session', async () => {
    const email = `refresh-${randomUUID()}@example.com`;
    const password = 'StrongPass!23';

    await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email, password },
    });

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email, password },
    });

    const refreshToken = loginResponse.json().data.refresh_token as string;

    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refresh_token: refreshToken },
    });

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.json().data.access_token).toBeTruthy();

    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      payload: { refresh_token: refreshResponse.json().data.refresh_token },
    });

    expect(logoutResponse.statusCode).toBe(204);
  });
});

describe('Stage 4 prodamus hmac', () => {
  it('creates deterministic signature for nested payload', async () => {
    const { createProdamusRequestSignature } = await import('../src/modules/payments/prodamus/hmac.js');
    const payload = {
      do: 'link',
      order_id: 'order-1',
      products: [{ name: 'Test', price: '6000', quantity: '1' }],
    };

    const first = createProdamusRequestSignature(payload, 'secret');
    const second = createProdamusRequestSignature(payload, 'secret');
    expect(first).toBe(second);
    expect(first).toHaveLength(64);
  });
});
