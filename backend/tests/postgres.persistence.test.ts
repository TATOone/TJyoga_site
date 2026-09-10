import { createHmac, randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { DEMO_STUDENT_ID } from '../src/persistence/demo.js';
import { applyMigrations } from '../src/persistence/migrate.js';
import { buildPostgresStore, type PostgresBackendStore } from '../src/persistence/postgres.js';

const { Pool } = pg;

const databaseUrl = process.env.POSTGRES_TEST_URL?.trim();
const describePostgres = databaseUrl ? describe : describe.skip;

const signPayload = (payload: string, secret = 'dev-prodamus-webhook-secret'): string =>
  createHmac('sha256', secret).update(payload).digest('hex');

const resetDatabase = async (url: string): Promise<void> => {
  const pool = new Pool({ connectionString: url });
  try {
    await applyMigrations(pool);
    await pool.query(`
      TRUNCATE TABLE
        zoom_redirect_logs,
        audit_log,
        user_consents,
        consent_documents,
        subscription_events,
        payments,
        payment_events,
        refresh_tokens,
        idempotency_keys,
        subscriptions,
        orders,
        videos,
        articles,
        zoom_links,
        users
      RESTART IDENTITY CASCADE
    `);
  } finally {
    await pool.end();
  }
};

describePostgres('PostgresBackendStore', () => {
  let store: PostgresBackendStore;
  let app: FastifyInstance;

  beforeAll(async () => {
    if (!databaseUrl) {
      return;
    }
    await resetDatabase(databaseUrl);
    store = await buildPostgresStore(databaseUrl, { seedDemo: true });
    app = await buildApp({ store });
    await app.ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('applies migrations and seeds demo catalog', async () => {
    const videos = await store.listVideos();
    const articles = await store.listArticles({ includeDrafts: true });
    const student = await store.getUserById(DEMO_STUDENT_ID);
    const subscription = await store.getSubscriptionByUserId(DEMO_STUDENT_ID);

    expect(videos.length).toBeGreaterThan(0);
    expect(articles.some((article) => article.access === 'club')).toBe(true);
    expect(student?.email).toBe('student@example.com');
    expect(subscription?.status).toBe('active');
  });

  it('deduplicates payment events at the SQL unique key', async () => {
    const input = {
      dedupKey: `prodamus:pg-test:${randomUUID()}`,
      providerPaymentId: `pdm_${randomUUID()}`,
      providerOrderId: 'order_abc',
      eventStatus: 'paid' as const,
      amountRub: 600000,
      signatureValid: true,
      payload: { source: 'postgres-test' },
    };

    const first = await store.recordPaymentEvent(input);
    const second = await store.recordPaymentEvent(input);

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.event.id).toBe(first.event.id);
  });

  it('persists register/login/checkout/webhook through the HTTP API', async () => {
    const email = `pg-${randomUUID()}@example.com`;
    const password = 'StrongPass!23';

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email, password, first_name: 'Postgres' },
    });
    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email, password },
    });
    expect(loginResponse.statusCode).toBe(200);
    const accessToken = loginResponse.json().data.access_token as string;

    const checkoutResponse = await app.inject({
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
        customer_email: email,
      },
      headers: {
        authorization: `Bearer ${accessToken}`,
        'idempotency-key': randomUUID(),
      },
    });
    expect(checkoutResponse.statusCode).toBe(201);

    const orderId = checkoutResponse.json().data.order_id as string;
    const order = await store.getOrderById(orderId);
    expect(order?.providerOrderId).toBeTruthy();

    const webhookPayload = JSON.stringify({
      provider_payment_id: `pdm_${randomUUID()}`,
      provider_order_id: order?.providerOrderId,
      status: 'paid',
      amount_rub: 600000,
      paid_at: '2026-06-11T21:40:00Z',
      raw: { event_id: `evt_${randomUUID()}` },
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
    expect(webhookResponse.json().data.duplicate).toBe(false);

    const replay = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/prodamus/webhook',
      payload: webhookPayload,
      headers: {
        'content-type': 'application/json',
        'x-prodamus-signature': signPayload(webhookPayload),
      },
    });
    expect(replay.statusCode).toBe(200);
    expect(replay.json().data.duplicate).toBe(true);

    const orderStatus = await app.inject({
      method: 'GET',
      url: `/api/v1/checkout/orders/${orderId}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
    expect(orderStatus.statusCode).toBe(200);
    expect(orderStatus.json().data.status).toBe('paid');
    expect(orderStatus.json().data.subscription_status).toBe('active');

    const user = await store.getUserByEmail(email);
    const subscription = user ? await store.getSubscriptionByUserId(user.id) : null;
    expect(subscription?.status).toBe('active');
    expect(subscription?.planCode).toBe('club-month');
  });

  it('survives process restart by reading previously committed rows', async () => {
    if (!databaseUrl) {
      return;
    }

    const email = `pg-restart-${randomUUID()}@example.com`;
    await store.createUser({
      email,
      role: 'student',
      status: 'active',
    });

    const reopened = await buildPostgresStore(databaseUrl, { seedDemo: false });
    try {
      const user = await reopened.getUserByEmail(email);
      expect(user?.email).toBe(email);
    } finally {
      await reopened.close();
    }
  });
});
