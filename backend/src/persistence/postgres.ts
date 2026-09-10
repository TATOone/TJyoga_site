import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { env } from '../config/env.js';
import { PLAN_CATALOG } from '../config/plans.js';
import { SEED_ARTICLES, SEED_VIDEOS } from '../config/seedContent.js';
import { hashPassword, verifyPassword } from '../security/password.js';
import type {
  ArticleRecord,
  AuditRecord,
  ConsentRecord,
  IdempotencyRecord,
  OrderRecord,
  PaymentEventRecord,
  PaymentRecord,
  RefreshTokenRecord,
  SubscriptionEventRecord,
  SubscriptionRecord,
  UserRecord,
  VideoRecord,
  ZoomLinkRecord,
  ZoomRedirectLogRecord,
} from '../types/domain.js';
import { addDays, toIso, toIsoOrNull } from './dates.js';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_ID,
  DEMO_ADMIN_PASSWORD,
  DEMO_PROVIDER_ORDER_ID,
  DEMO_STUDENT_EMAIL,
  DEMO_STUDENT_ID,
  DEMO_STUDENT_PASSWORD,
} from './demo.js';
import { applyMigrations } from './migrate.js';
import { toInet, type SqlExecutor } from './sql.js';
import type {
  BackendStore,
  CreateOrderInput,
  CreateUserInput,
  RecordPaymentEventInput,
  RecordPaymentEventResult,
  SaveConsentInput,
} from './store.js';

const { Pool } = pg;

const CONSENT_DOC_TYPES: ConsentRecord['docType'][] = [
  'offer',
  'privacy',
  'refund',
  'medical_disclaimer',
  'cookies',
];

interface UserRow {
  id: string;
  email: string;
  role: UserRecord['role'];
  status: UserRecord['status'];
  created_at: Date | string;
  updated_at: Date | string;
  password_hash?: string | null;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_code: string;
  status: SubscriptionRecord['status'];
  starts_at: Date | string;
  ends_at: Date | string;
  grace_ends_at: Date | string | null;
  manual_extended_until: Date | string | null;
  renewal_mode: 'manual';
  updated_at: Date | string;
}

interface OrderRow {
  id: string;
  user_id: string;
  plan_code: string;
  amount_rub: number;
  status: OrderRecord['status'];
  provider_order_id: string | null;
  idempotency_key: string | null;
  payment_url: string | null;
  payment_expires_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface ConsentRow {
  id: string;
  user_id: string;
  doc_type: ConsentRecord['docType'];
  version: string;
  accepted_at: Date | string;
  source: ConsentRecord['source'];
}

interface ZoomLinkRow {
  id: string;
  room: string;
  target_url: string;
  status: ZoomLinkRecord['status'];
  updated_at: Date | string;
}

interface VideoRow {
  id: string;
  kinescope_id: string;
  title: string;
  description: string;
  category: VideoRecord['category'];
  access_level: VideoRecord['accessLevel'];
  duration_min: number;
  status: VideoRecord['status'];
  published_at: Date | string;
  updated_at: Date | string;
}

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: ArticleRecord['category'];
  access: ArticleRecord['access'];
  status: ArticleRecord['status'];
  published_at: Date | string;
  updated_at: Date | string;
}

interface PaymentRow {
  id: string;
  order_id: string;
  provider: 'prodamus';
  provider_payment_id: string;
  status: PaymentRecord['status'];
  amount_rub: number;
  paid_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface IdempotencyRow {
  key: string;
  request_hash: string;
  response_body: Record<string, unknown>;
  status_code: number;
  created_at: Date | string;
  expires_at: Date | string;
}

interface RefreshTokenRow {
  token: string;
  user_id: string;
  expires_at: Date | string;
  revoked_at: Date | string | null;
  created_at: Date | string;
}

interface PaymentEventRow {
  id: string;
  dedup_key: string;
  provider: 'prodamus';
  provider_payment_id: string;
  provider_order_id: string | null;
  event_status: PaymentEventRecord['eventStatus'];
  amount_rub: number;
  signature_valid: boolean;
  payload: Record<string, unknown>;
  created_at: Date | string;
}

interface SubscriptionEventRow {
  id: string;
  subscription_id: string;
  event_type: SubscriptionEventRecord['eventType'];
  actor_type: SubscriptionEventRecord['actorType'];
  actor_user_id: string | null;
  reason: string | null;
  created_at: Date | string;
}

interface AuditRow {
  id: string;
  actor_user_id: string | null;
  actor_role: AuditRecord['actorRole'];
  action: string;
  entity_type: string;
  entity_id: string;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  request_id: string;
  ip: string | null;
  user_agent: string | null;
  created_at: Date | string;
}

interface ZoomRedirectLogRow {
  id: string;
  user_id: string | null;
  zoom_link_id: string | null;
  room: string;
  result: ZoomRedirectLogRecord['result'];
  reason: string;
  ip: string | null;
  user_agent: string | null;
  request_id: string;
  created_at: Date | string;
}

const mapUser = (row: UserRow): UserRecord => ({
  id: row.id,
  email: row.email,
  role: row.role,
  status: row.status,
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const mapSubscription = (row: SubscriptionRow): SubscriptionRecord => ({
  id: row.id,
  userId: row.user_id,
  planCode: row.plan_code,
  status: row.status,
  startsAt: toIso(row.starts_at),
  endsAt: toIso(row.ends_at),
  graceEndsAt: toIsoOrNull(row.grace_ends_at),
  manualExtendedUntil: toIsoOrNull(row.manual_extended_until),
  renewalMode: 'manual',
  updatedAt: toIso(row.updated_at),
});

const mapOrder = (row: OrderRow): OrderRecord => ({
  id: row.id,
  userId: row.user_id,
  planCode: row.plan_code,
  amountRub: row.amount_rub,
  status: row.status,
  providerOrderId: row.provider_order_id,
  idempotencyKey: row.idempotency_key,
  paymentUrl: row.payment_url,
  paymentExpiresAt: toIsoOrNull(row.payment_expires_at),
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const mapConsent = (row: ConsentRow): ConsentRecord => ({
  id: row.id,
  userId: row.user_id,
  docType: row.doc_type,
  version: row.version,
  acceptedAt: toIso(row.accepted_at),
  source: row.source,
});

const mapZoomLink = (row: ZoomLinkRow): ZoomLinkRecord => ({
  id: row.id,
  room: row.room,
  targetUrl: row.target_url,
  status: row.status,
  updatedAt: toIso(row.updated_at),
});

const mapVideo = (row: VideoRow): VideoRecord => ({
  id: row.id,
  kinescopeId: row.kinescope_id,
  title: row.title,
  description: row.description,
  category: row.category,
  accessLevel: row.access_level,
  durationMin: row.duration_min,
  status: row.status,
  publishedAt: toIso(row.published_at),
  updatedAt: toIso(row.updated_at),
});

const mapArticle = (row: ArticleRow): ArticleRecord => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  body: row.body,
  category: row.category,
  access: row.access,
  status: row.status,
  publishedAt: toIso(row.published_at),
  updatedAt: toIso(row.updated_at),
});

const mapPayment = (row: PaymentRow): PaymentRecord => ({
  id: row.id,
  orderId: row.order_id,
  provider: 'prodamus',
  providerPaymentId: row.provider_payment_id,
  status: row.status,
  amountRub: row.amount_rub,
  paidAt: toIsoOrNull(row.paid_at),
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const mapIdempotency = (row: IdempotencyRow): IdempotencyRecord => ({
  key: row.key,
  requestHash: row.request_hash,
  responseBody: row.response_body,
  statusCode: row.status_code,
  createdAt: toIso(row.created_at),
  expiresAt: toIso(row.expires_at),
});

const mapRefreshToken = (row: RefreshTokenRow): RefreshTokenRecord => ({
  token: row.token,
  userId: row.user_id,
  expiresAt: toIso(row.expires_at),
  revokedAt: toIsoOrNull(row.revoked_at),
  createdAt: toIso(row.created_at),
});

const mapPaymentEvent = (row: PaymentEventRow): PaymentEventRecord => ({
  id: row.id,
  dedupKey: row.dedup_key,
  provider: 'prodamus',
  providerPaymentId: row.provider_payment_id,
  providerOrderId: row.provider_order_id,
  eventStatus: row.event_status,
  amountRub: row.amount_rub,
  signatureValid: row.signature_valid,
  payload: row.payload ?? {},
  createdAt: toIso(row.created_at),
});

const mapSubscriptionEvent = (row: SubscriptionEventRow): SubscriptionEventRecord => ({
  id: row.id,
  subscriptionId: row.subscription_id,
  eventType: row.event_type,
  actorType: row.actor_type,
  actorUserId: row.actor_user_id,
  reason: row.reason,
  createdAt: toIso(row.created_at),
});

const mapAudit = (row: AuditRow): AuditRecord => ({
  id: row.id,
  actorUserId: row.actor_user_id,
  actorRole: row.actor_role,
  action: row.action,
  entityType: row.entity_type,
  entityId: row.entity_id,
  beforeState: row.before_state,
  afterState: row.after_state,
  requestId: row.request_id,
  ip: row.ip,
  userAgent: row.user_agent,
  createdAt: toIso(row.created_at),
});

const mapZoomRedirectLog = (row: ZoomRedirectLogRow): ZoomRedirectLogRecord => ({
  id: row.id,
  userId: row.user_id,
  zoomLinkId: row.zoom_link_id,
  room: row.room,
  result: row.result,
  reason: row.reason,
  ip: row.ip,
  userAgent: row.user_agent,
  requestId: row.request_id,
  createdAt: toIso(row.created_at),
});

export interface PostgresStoreOptions {
  seedDemo?: boolean;
  ownsPool?: boolean;
}

export class PostgresBackendStore implements BackendStore {
  constructor(
    private readonly db: SqlExecutor,
    private readonly options: PostgresStoreOptions = {},
  ) {}

  public async runInTransaction<T>(fn: (store: BackendStore) => Promise<T>): Promise<T> {
    const pool = this.asPool();
    if (!pool) {
      return fn(this);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const transactional = new PostgresBackendStore(client, { ownsPool: false, seedDemo: false });
      const result = await fn(transactional);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    const pool = this.asPool();
    if (this.options.ownsPool && pool) {
      await pool.end();
    }
  }

  private asPool(): pg.Pool | null {
    const candidate = this.db as pg.Pool;
    if (typeof candidate.connect === 'function' && typeof candidate.end === 'function') {
      return candidate;
    }
    return null;
  }

  public async getUserById(userId: string): Promise<UserRecord | null> {
    const result = await this.db.query<UserRow>('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }

  public async getUserByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.db.query<UserRow>('SELECT * FROM users WHERE email = $1', [
      email.trim().toLowerCase(),
    ]);
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }

  public async createUser(input: CreateUserInput): Promise<UserRecord> {
    const result = await this.db.query<UserRow>(
      `
        INSERT INTO users (id, email, role, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [input.id ?? randomUUID(), input.email.trim().toLowerCase(), input.role, input.status],
    );
    return mapUser(result.rows[0]);
  }

  public async saveLocalCredentials(userId: string, password: string): Promise<void> {
    await this.db.query(
      `
        UPDATE users
        SET password_hash = $2, updated_at = NOW()
        WHERE id = $1
      `,
      [userId, await hashPassword(password)],
    );
  }

  public async verifyLocalCredentials(
    userId: string,
    password: string,
  ): Promise<{ ok: boolean; needsRehash: boolean }> {
    const result = await this.db.query<{ password_hash: string | null }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId],
    );
    const stored = result.rows[0]?.password_hash;
    if (!stored) {
      return { ok: false, needsRehash: false };
    }
    return verifyPassword(password, stored);
  }

  public async rehashLocalCredentials(userId: string, password: string): Promise<void> {
    await this.saveLocalCredentials(userId, password);
  }

  public async getSubscriptionByUserId(userId: string): Promise<SubscriptionRecord | null> {
    const result = await this.db.query<SubscriptionRow>(
      `
        SELECT *
        FROM subscriptions
        WHERE user_id = $1
        ORDER BY updated_at DESC
        LIMIT 1
      `,
      [userId],
    );
    return result.rows[0] ? mapSubscription(result.rows[0]) : null;
  }

  public async getOrderById(orderId: string): Promise<OrderRecord | null> {
    const result = await this.db.query<OrderRow>('SELECT * FROM orders WHERE id = $1', [orderId]);
    return result.rows[0] ? mapOrder(result.rows[0]) : null;
  }

  public async getOrderByProviderOrderId(providerOrderId: string): Promise<OrderRecord | null> {
    const result = await this.db.query<OrderRow>(
      'SELECT * FROM orders WHERE provider_order_id = $1',
      [providerOrderId],
    );
    return result.rows[0] ? mapOrder(result.rows[0]) : null;
  }

  public async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    const result = await this.db.query<OrderRow>(
      `
        INSERT INTO orders (
          user_id, plan_code, status, amount_rub, provider_order_id,
          idempotency_key, payment_url, payment_expires_at
        )
        VALUES ($1, $2, 'pending_payment', $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [
        input.userId,
        input.planCode,
        input.amountRub,
        input.providerOrderId,
        input.idempotencyKey,
        input.paymentUrl,
        input.paymentExpiresAt,
      ],
    );
    return mapOrder(result.rows[0]);
  }

  public async getConsentByUserId(userId: string): Promise<ConsentRecord[]> {
    const result = await this.db.query<ConsentRow>(
      `
        SELECT
          uc.id,
          uc.user_id,
          cd.doc_type,
          cd.version,
          uc.accepted_at,
          uc.source
        FROM user_consents uc
        JOIN consent_documents cd ON cd.id = uc.consent_document_id
        WHERE uc.user_id = $1
        ORDER BY uc.accepted_at ASC
      `,
      [userId],
    );
    return result.rows.map(mapConsent);
  }

  public async saveUserConsents(inputs: SaveConsentInput[]): Promise<ConsentRecord[]> {
    const saved: ConsentRecord[] = [];

    for (const input of inputs) {
      const document = await this.db.query<{ id: string }>(
        `
          INSERT INTO consent_documents (doc_type, version, content_hash, is_active)
          VALUES ($1, $2, $3, TRUE)
          ON CONFLICT (doc_type, version)
          DO UPDATE SET is_active = TRUE
          RETURNING id
        `,
        [input.docType, input.version, `seed:${input.docType}:${input.version}`],
      );

      const result = await this.db.query<ConsentRow>(
        `
          INSERT INTO user_consents (user_id, consent_document_id, source)
          VALUES ($1, $2, $3)
          RETURNING
            id,
            user_id,
            $4::text AS doc_type,
            $5::text AS version,
            accepted_at,
            source
        `,
        [input.userId, document.rows[0].id, input.source, input.docType, input.version],
      );
      saved.push(mapConsent(result.rows[0]));
    }

    return saved;
  }

  public async getActiveZoomLink(room: string): Promise<ZoomLinkRecord | null> {
    const result = await this.db.query<ZoomLinkRow>(
      `
        SELECT *
        FROM zoom_links
        WHERE room = $1 AND status = 'active'
      `,
      [room],
    );
    return result.rows[0] ? mapZoomLink(result.rows[0]) : null;
  }

  public async upsertZoomLink(
    room: string,
    targetUrl: string,
    status: ZoomLinkRecord['status'] = 'active',
  ): Promise<ZoomLinkRecord> {
    const result = await this.db.query<ZoomLinkRow>(
      `
        INSERT INTO zoom_links (room, target_url, status, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (room)
        DO UPDATE SET
          target_url = EXCLUDED.target_url,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING *
      `,
      [room, targetUrl, status],
    );
    return mapZoomLink(result.rows[0]);
  }

  public async listVideos(options: { includeDrafts?: boolean } = {}): Promise<VideoRecord[]> {
    const result = await this.db.query<VideoRow>(
      `
        SELECT *
        FROM videos
        WHERE ($1::boolean OR status = 'published')
        ORDER BY published_at DESC
      `,
      [Boolean(options.includeDrafts)],
    );
    return result.rows.map(mapVideo);
  }

  public async getVideoById(videoId: string): Promise<VideoRecord | null> {
    const result = await this.db.query<VideoRow>('SELECT * FROM videos WHERE id = $1', [videoId]);
    return result.rows[0] ? mapVideo(result.rows[0]) : null;
  }

  public async upsertVideo(
    video: Omit<VideoRecord, 'updatedAt'> & { updatedAt?: string },
  ): Promise<VideoRecord> {
    const result = await this.db.query<VideoRow>(
      `
        INSERT INTO videos (
          id, kinescope_id, title, description, category, access_level,
          duration_min, status, published_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, NOW()))
        ON CONFLICT (id) DO UPDATE SET
          kinescope_id = EXCLUDED.kinescope_id,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          access_level = EXCLUDED.access_level,
          duration_min = EXCLUDED.duration_min,
          status = EXCLUDED.status,
          published_at = EXCLUDED.published_at,
          updated_at = COALESCE($10::timestamptz, NOW())
        RETURNING *
      `,
      [
        video.id,
        video.kinescopeId,
        video.title,
        video.description,
        video.category,
        video.accessLevel,
        video.durationMin,
        video.status,
        video.publishedAt,
        video.updatedAt ?? null,
      ],
    );
    return mapVideo(result.rows[0]);
  }

  public async listArticles(
    options: { includeDrafts?: boolean; access?: ArticleRecord['access'] } = {},
  ): Promise<ArticleRecord[]> {
    const result = await this.db.query<ArticleRow>(
      `
        SELECT *
        FROM articles
        WHERE ($1::boolean OR status = 'published')
          AND ($2::text IS NULL OR access = $2)
        ORDER BY published_at DESC
      `,
      [Boolean(options.includeDrafts), options.access ?? null],
    );
    return result.rows.map(mapArticle);
  }

  public async getArticleBySlug(slug: string): Promise<ArticleRecord | null> {
    const result = await this.db.query<ArticleRow>('SELECT * FROM articles WHERE slug = $1', [slug]);
    return result.rows[0] ? mapArticle(result.rows[0]) : null;
  }

  public async upsertArticle(
    article: Omit<ArticleRecord, 'updatedAt'> & { updatedAt?: string },
  ): Promise<ArticleRecord> {
    const result = await this.db.query<ArticleRow>(
      `
        INSERT INTO articles (
          id, slug, title, excerpt, body, category, access, status, published_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, NOW()))
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          body = EXCLUDED.body,
          category = EXCLUDED.category,
          access = EXCLUDED.access,
          status = EXCLUDED.status,
          published_at = EXCLUDED.published_at,
          updated_at = COALESCE($10::timestamptz, NOW())
        RETURNING *
      `,
      [
        article.id,
        article.slug,
        article.title,
        article.excerpt,
        article.body,
        article.category,
        article.access,
        article.status,
        article.publishedAt,
        article.updatedAt ?? null,
      ],
    );
    return mapArticle(result.rows[0]);
  }

  public async listUsers(): Promise<UserRecord[]> {
    const result = await this.db.query<UserRow>('SELECT * FROM users ORDER BY created_at ASC');
    return result.rows.map(mapUser);
  }

  public async listSubscriptions(): Promise<SubscriptionRecord[]> {
    const result = await this.db.query<SubscriptionRow>(
      'SELECT * FROM subscriptions ORDER BY updated_at DESC',
    );
    return result.rows.map(mapSubscription);
  }

  public async listOrders(): Promise<OrderRecord[]> {
    const result = await this.db.query<OrderRow>('SELECT * FROM orders ORDER BY created_at DESC');
    return result.rows.map(mapOrder);
  }

  public async listPayments(): Promise<PaymentRecord[]> {
    const result = await this.db.query<PaymentRow>(
      'SELECT * FROM payments ORDER BY created_at DESC',
    );
    return result.rows.map(mapPayment);
  }

  public async extendSubscription(
    userId: string,
    endsAtIso: string,
    actorUserId: string | null,
  ): Promise<SubscriptionRecord | null> {
    const result = await this.db.query<SubscriptionRow>(
      `
        UPDATE subscriptions
        SET
          status = 'active',
          ends_at = $2,
          grace_ends_at = $3,
          manual_extended_until = $2,
          updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `,
      [userId, endsAtIso, addDays(endsAtIso, 3)],
    );
    if (!result.rows[0]) {
      return null;
    }

    const next = mapSubscription(result.rows[0]);
    await this.saveSubscriptionEvent({
      subscriptionId: next.id,
      eventType: 'renewed',
      actorType: actorUserId ? 'admin' : 'system',
      actorUserId,
      reason: 'manual_extend',
    });
    return next;
  }

  public async getIdempotencyRecord(key: string): Promise<IdempotencyRecord | null> {
    const result = await this.db.query<IdempotencyRow>(
      'SELECT * FROM idempotency_keys WHERE key = $1',
      [key],
    );
    const row = result.rows[0];
    if (!row) {
      return null;
    }

    const record = mapIdempotency(row);
    if (Date.parse(record.expiresAt) <= Date.now()) {
      await this.db.query('DELETE FROM idempotency_keys WHERE key = $1', [key]);
      return null;
    }

    return record;
  }

  public async saveIdempotencyRecord(record: IdempotencyRecord): Promise<IdempotencyRecord> {
    const result = await this.db.query<IdempotencyRow>(
      `
        INSERT INTO idempotency_keys (key, request_hash, response_body, status_code, created_at, expires_at)
        VALUES ($1, $2, $3::jsonb, $4, $5, $6)
        ON CONFLICT (key) DO UPDATE SET
          request_hash = EXCLUDED.request_hash,
          response_body = EXCLUDED.response_body,
          status_code = EXCLUDED.status_code,
          created_at = EXCLUDED.created_at,
          expires_at = EXCLUDED.expires_at
        RETURNING *
      `,
      [
        record.key,
        record.requestHash,
        JSON.stringify(record.responseBody),
        record.statusCode,
        record.createdAt,
        record.expiresAt,
      ],
    );
    return mapIdempotency(result.rows[0]);
  }

  public async saveRefreshToken(
    record: Omit<RefreshTokenRecord, 'revokedAt' | 'createdAt'>,
  ): Promise<RefreshTokenRecord> {
    const result = await this.db.query<RefreshTokenRow>(
      `
        INSERT INTO refresh_tokens (token, user_id, expires_at, revoked_at, created_at)
        VALUES ($1, $2, $3, NULL, NOW())
        ON CONFLICT (token) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          expires_at = EXCLUDED.expires_at,
          revoked_at = NULL
        RETURNING *
      `,
      [record.token, record.userId, record.expiresAt],
    );
    return mapRefreshToken(result.rows[0]);
  }

  public async getRefreshToken(token: string): Promise<RefreshTokenRecord | null> {
    const result = await this.db.query<RefreshTokenRow>(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [token],
    );
    return result.rows[0] ? mapRefreshToken(result.rows[0]) : null;
  }

  public async revokeRefreshToken(token: string): Promise<RefreshTokenRecord | null> {
    const result = await this.db.query<RefreshTokenRow>(
      `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE token = $1
        RETURNING *
      `,
      [token],
    );
    return result.rows[0] ? mapRefreshToken(result.rows[0]) : null;
  }

  public async recordPaymentEvent(input: RecordPaymentEventInput): Promise<RecordPaymentEventResult> {
    const inserted = await this.db.query<PaymentEventRow>(
      `
        INSERT INTO payment_events (
          dedup_key, provider, provider_payment_id, provider_order_id,
          event_status, amount_rub, signature_valid, payload
        )
        VALUES ($1, 'prodamus', $2, $3, $4, $5, $6, $7::jsonb)
        ON CONFLICT (dedup_key) DO NOTHING
        RETURNING *
      `,
      [
        input.dedupKey,
        input.providerPaymentId,
        input.providerOrderId,
        input.eventStatus,
        input.amountRub,
        input.signatureValid,
        JSON.stringify(input.payload),
      ],
    );

    if (inserted.rows[0]) {
      return {
        duplicate: false,
        event: mapPaymentEvent(inserted.rows[0]),
      };
    }

    const existing = await this.db.query<PaymentEventRow>(
      'SELECT * FROM payment_events WHERE dedup_key = $1',
      [input.dedupKey],
    );
    return {
      duplicate: true,
      event: mapPaymentEvent(existing.rows[0]),
    };
  }

  public async markOrderPaid(orderId: string): Promise<OrderRecord | null> {
    const result = await this.db.query<OrderRow>(
      `
        UPDATE orders
        SET status = 'paid', updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [orderId],
    );
    return result.rows[0] ? mapOrder(result.rows[0]) : null;
  }

  public async upsertSubscriptionForOrder(
    order: OrderRecord,
    paidAtIso: string,
  ): Promise<SubscriptionRecord> {
    const plan = PLAN_CATALOG[order.planCode];
    const durationDays = plan?.durationDays ?? 30;
    const startsAt = paidAtIso;
    const endsAt = addDays(startsAt, durationDays);
    const graceEndsAt = addDays(startsAt, durationDays + 3);

    const result = await this.db.query<SubscriptionRow>(
      `
        INSERT INTO subscriptions (
          user_id, source_order_id, plan_code, status, starts_at, ends_at,
          grace_ends_at, manual_extended_until, renewal_mode
        )
        VALUES ($1, $2, $3, 'active', $4, $5, $6, NULL, 'manual')
        ON CONFLICT (user_id) DO UPDATE SET
          source_order_id = EXCLUDED.source_order_id,
          plan_code = EXCLUDED.plan_code,
          status = 'active',
          starts_at = EXCLUDED.starts_at,
          ends_at = EXCLUDED.ends_at,
          grace_ends_at = EXCLUDED.grace_ends_at,
          updated_at = NOW()
        RETURNING *
      `,
      [order.userId, order.id, order.planCode, startsAt, endsAt, graceEndsAt],
    );
    return mapSubscription(result.rows[0]);
  }

  public async savePayment(
    record: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PaymentRecord> {
    const result = await this.db.query<PaymentRow>(
      `
        INSERT INTO payments (
          order_id, provider, provider_payment_id, status, amount_rub, paid_at, raw_payload
        )
        VALUES ($1, 'prodamus', $2, $3, $4, $5, '{}'::jsonb)
        ON CONFLICT (provider_payment_id) DO UPDATE SET
          status = EXCLUDED.status,
          amount_rub = EXCLUDED.amount_rub,
          paid_at = EXCLUDED.paid_at,
          updated_at = NOW()
        RETURNING *
      `,
      [record.orderId, record.providerPaymentId, record.status, record.amountRub, record.paidAt],
    );
    return mapPayment(result.rows[0]);
  }

  public async saveSubscriptionEvent(
    record: Omit<SubscriptionEventRecord, 'id' | 'createdAt'>,
  ): Promise<SubscriptionEventRecord> {
    const result = await this.db.query<SubscriptionEventRow>(
      `
        INSERT INTO subscription_events (
          subscription_id, event_type, actor_type, actor_user_id, reason
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [record.subscriptionId, record.eventType, record.actorType, record.actorUserId, record.reason],
    );
    return mapSubscriptionEvent(result.rows[0]);
  }

  public async saveAudit(record: Omit<AuditRecord, 'id' | 'createdAt'>): Promise<AuditRecord> {
    const result = await this.db.query<AuditRow>(
      `
        INSERT INTO audit_log (
          actor_user_id, actor_role, action, entity_type, entity_id,
          before_state, after_state, request_id, ip, user_agent
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9::inet, $10)
        RETURNING *
      `,
      [
        record.actorUserId,
        record.actorRole,
        record.action,
        record.entityType,
        record.entityId,
        record.beforeState ? JSON.stringify(record.beforeState) : null,
        record.afterState ? JSON.stringify(record.afterState) : null,
        record.requestId,
        toInet(record.ip),
        record.userAgent,
      ],
    );
    return mapAudit(result.rows[0]);
  }

  public async saveZoomRedirectLog(
    record: Omit<ZoomRedirectLogRecord, 'id' | 'createdAt'>,
  ): Promise<ZoomRedirectLogRecord> {
    const result = await this.db.query<ZoomRedirectLogRow>(
      `
        INSERT INTO zoom_redirect_logs (
          user_id, zoom_link_id, room, result, reason, ip, user_agent, request_id
        )
        VALUES ($1, $2, $3, $4, $5, $6::inet, $7, $8)
        RETURNING *
      `,
      [
        record.userId,
        record.zoomLinkId,
        record.room,
        record.result,
        record.reason,
        toInet(record.ip),
        record.userAgent,
        record.requestId,
      ],
    );
    return mapZoomRedirectLog(result.rows[0]);
  }

  public async seed(options: { demo?: boolean } = {}): Promise<void> {
    for (const docType of CONSENT_DOC_TYPES) {
      await this.db.query(
        `
          INSERT INTO consent_documents (doc_type, version, content_hash, is_active)
          VALUES ($1, '1.0.0', $2, TRUE)
          ON CONFLICT (doc_type, version) DO NOTHING
        `,
        [docType, `seed:${docType}:1.0.0`],
      );
    }

    for (const video of SEED_VIDEOS) {
      await this.db.query(
        `
          INSERT INTO videos (
            id, kinescope_id, title, description, category, access_level,
            duration_min, status, published_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          video.id,
          video.kinescopeId,
          video.title,
          video.description,
          video.category,
          video.accessLevel,
          video.durationMin,
          video.status,
          video.publishedAt,
          video.updatedAt,
        ],
      );
    }

    for (const article of SEED_ARTICLES) {
      await this.db.query(
        `
          INSERT INTO articles (
            id, slug, title, excerpt, body, category, access, status, published_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          article.id,
          article.slug,
          article.title,
          article.excerpt,
          article.body,
          article.category,
          article.access,
          article.status,
          article.publishedAt,
          article.updatedAt,
        ],
      );
    }

    await this.db.query(
      `
        INSERT INTO zoom_links (room, target_url, status, updated_at)
        VALUES ('main', $1, 'active', NOW())
        ON CONFLICT (room) DO NOTHING
      `,
      [env.ZOOM_ROOM_MAIN_URL],
    );

    if (!options.demo) {
      return;
    }

    await this.db.query(
      `
        INSERT INTO users (id, email, role, status)
        VALUES
          ($1, $2, 'student', 'active'),
          ($3, $4, 'admin', 'active')
        ON CONFLICT (id) DO NOTHING
      `,
      [DEMO_STUDENT_ID, DEMO_STUDENT_EMAIL, DEMO_ADMIN_ID, DEMO_ADMIN_EMAIL],
    );

    const student = await this.db.query<{ password_hash: string | null }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [DEMO_STUDENT_ID],
    );
    if (!student.rows[0]?.password_hash) {
      await this.saveLocalCredentials(DEMO_STUDENT_ID, DEMO_STUDENT_PASSWORD);
    }

    const admin = await this.db.query<{ password_hash: string | null }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [DEMO_ADMIN_ID],
    );
    if (!admin.rows[0]?.password_hash) {
      await this.saveLocalCredentials(DEMO_ADMIN_ID, DEMO_ADMIN_PASSWORD);
    }

    const now = new Date().toISOString();
    await this.db.query(
      `
        INSERT INTO orders (
          user_id, plan_code, status, amount_rub, provider_order_id
        )
        VALUES ($1, 'club-month', 'pending_payment', 600000, $2)
        ON CONFLICT (provider_order_id) DO NOTHING
      `,
      [DEMO_STUDENT_ID, DEMO_PROVIDER_ORDER_ID],
    );

    await this.db.query(
      `
        INSERT INTO subscriptions (
          user_id, plan_code, status, starts_at, ends_at, grace_ends_at, renewal_mode
        )
        VALUES ($1, 'club-month', 'active', $2, $3, $4, 'manual')
        ON CONFLICT (user_id) DO NOTHING
      `,
      [DEMO_STUDENT_ID, now, addDays(now, 30), addDays(now, 33)],
    );
  }
}

export interface BuildPostgresStoreOptions {
  seedDemo?: boolean;
}

export const buildPostgresStore = async (
  databaseUrl: string,
  options: BuildPostgresStoreOptions = {},
): Promise<PostgresBackendStore> => {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

  try {
    await applyMigrations(pool);
    const store = new PostgresBackendStore(pool, { ownsPool: true, seedDemo: options.seedDemo });
    await store.seed({ demo: options.seedDemo ?? env.NODE_ENV !== 'production' });
    return store;
  } catch (error) {
    await pool.end();
    throw error;
  }
};
