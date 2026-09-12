import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { ADMIN_ACCESS_EMAILS, isAdminEmailAllowed } from '../src/config/adminAccess.js';
import { buildApp } from '../src/app.js';

const DEMO_ADMIN_ID = '00000000-0000-4000-8000-000000000001';
const DEMO_STUDENT_ID = '00000000-0000-4000-8000-000000000002';

const createAllowlistedAdmin = async (
  app: FastifyInstance,
  email: string = ADMIN_ACCESS_EMAILS[0],
) => {
  const existing = await app.store.getUserByEmail(email);
  if (existing) {
    return existing;
  }
  return app.store.createUser({
    email,
    role: 'admin',
    status: 'active',
  });
};

describe('Admin email allowlist', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('normalizes emails case-insensitively', () => {
    expect(isAdminEmailAllowed('tim.ohana@yandex.ru')).toBe(true);
    expect(isAdminEmailAllowed('Tim.Ohana@Yandex.RU')).toBe(true);
    expect(isAdminEmailAllowed('evgeniawoita@gmail.com')).toBe(true);
    expect(isAdminEmailAllowed('EVGENIAWOITA@GMAIL.COM')).toBe(true);
    expect(isAdminEmailAllowed('evgeniawoita@yandex.ru')).toBe(false);
    expect(isAdminEmailAllowed('admin@example.com')).toBe(false);
  });

  it('allows allowlisted admin to call admin API', async () => {
    const admin = await createAllowlistedAdmin(app);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/overview',
      headers: {
        'x-user-id': admin.id,
        'x-user-role': 'admin',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.plans).toBeTruthy();
  });

  it('denies demo admin even when role is admin', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/overview',
      headers: {
        'x-user-id': DEMO_ADMIN_ID,
        'x-user-role': 'admin',
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('FORBIDDEN');
  });

  it('denies editor and support even with allowlisted email', async () => {
    const editor = await app.store.createUser({
      email: ADMIN_ACCESS_EMAILS[1],
      role: 'editor',
      status: 'active',
    });

    const editorResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/overview',
      headers: {
        'x-user-id': editor.id,
        'x-user-role': 'editor',
      },
    });
    expect(editorResponse.statusCode).toBe(403);

    const supportResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/subscriptions/extend',
      headers: {
        'content-type': 'application/json',
        'x-user-id': editor.id,
        'x-user-role': 'support',
      },
      payload: {
        user_id: DEMO_STUDENT_ID,
        ends_at: '2027-01-01T00:00:00.000Z',
      },
    });
    expect(supportResponse.statusCode).toBe(403);
  });

  it('denies student on foundation admin ping', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/foundation/ping',
      headers: {
        'x-user-id': DEMO_STUDENT_ID,
        'x-user-role': 'student',
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it('keeps registration as student even if client sends role', async () => {
    const email = `no-self-admin-${Date.now()}@example.com`;
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email,
        password: 'StrongPass!23',
        role: 'admin',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.role).toBe('student');

    const stored = await app.store.getUserByEmail(email);
    expect(stored?.role).toBe('student');
  });

  it('returns email on login so frontend can gate admin UI', async () => {
    const existing = await app.store.getUserByEmail('tim.ohana@yandex.ru');
    const admin =
      existing ??
      (await createAllowlistedAdmin(app, 'tim.ohana@yandex.ru'));
    await app.store.saveLocalCredentials(admin.id, 'StrongPass!23');

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'Tim.Ohana@Yandex.RU',
        password: 'StrongPass!23',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.user.email).toBe('tim.ohana@yandex.ru');
    expect(response.json().data.user.role).toBe('admin');
  });
});
