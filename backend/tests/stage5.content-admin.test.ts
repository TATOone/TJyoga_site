import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

const DEMO_STUDENT_ID = '00000000-0000-4000-8000-000000000002';
const DEMO_ADMIN_ID = '00000000-0000-4000-8000-000000000001';

describe('Stage 5 content and admin endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists public articles without auth', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/content/articles',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body.data.articles)).toBe(true);
    expect(body.data.articles.every((item: { access: string }) => item.access === 'public')).toBe(
      true,
    );
  });

  it('returns club articles for subscribed student', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/content/articles',
      headers: {
        'x-user-id': DEMO_STUDENT_ID,
        'x-user-role': 'student',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.articles.some((item: { access: string }) => item.access === 'club')).toBe(true);
  });

  it('lists videos for subscribed student', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/content/videos',
      headers: {
        'x-user-id': DEMO_STUDENT_ID,
        'x-user-role': 'student',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.videos.length).toBeGreaterThan(0);
  });

  it('returns zoom redirect url in json format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/access/zoom/main?format=json',
      headers: {
        'x-user-id': DEMO_STUDENT_ID,
        'x-user-role': 'student',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.redirect_url).toContain('zoom.us');
  });

  it('allows admin overview and video upsert', async () => {
    const overview = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/overview',
      headers: {
        'x-user-id': DEMO_ADMIN_ID,
        'x-user-role': 'admin',
      },
    });
    expect(overview.statusCode).toBe(200);
    expect(overview.json().data.videos_count).toBeGreaterThan(0);

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/videos',
      headers: {
        'content-type': 'application/json',
        'x-user-id': DEMO_ADMIN_ID,
        'x-user-role': 'admin',
      },
      payload: {
        kinescope_id: 'test-kinescope-id',
        title: 'Тестовое видео',
        category: 'new',
      },
    });

    expect(created.statusCode).toBe(201);
    expect(created.json().data.video.kinescopeId).toBe('test-kinescope-id');
  });

  it('denies admin overview for student', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/overview',
      headers: {
        'x-user-id': DEMO_STUDENT_ID,
        'x-user-role': 'student',
      },
    });

    expect(response.statusCode).toBe(403);
  });
});
