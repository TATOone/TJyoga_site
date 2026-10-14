import { randomUUID } from 'node:crypto';
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
import { PLAN_CATALOG } from '../config/plans.js';
import { SEED_ARTICLES, SEED_VIDEOS } from '../config/seedContent.js';
import { hashPassword, verifyPassword } from '../security/password.js';
import { addDays } from './dates.js';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_ID,
  DEMO_ADMIN_PASSWORD,
  DEMO_PROVIDER_ORDER_ID,
  DEMO_STUDENT_EMAIL,
  DEMO_STUDENT_ID,
  DEMO_STUDENT_PASSWORD,
} from './demo.js';

export interface RecordPaymentEventInput {
  dedupKey: string;
  providerPaymentId: string;
  providerOrderId: string | null;
  eventStatus: PaymentEventRecord['eventStatus'];
  amountRub: number;
  signatureValid: boolean;
  payload: Record<string, unknown>;
}

export interface RecordPaymentEventResult {
  duplicate: boolean;
  event: PaymentEventRecord;
}

export interface CreateUserInput {
  id?: string;
  email: string;
  role: UserRecord['role'];
  status: UserRecord['status'];
}

export interface CreateOrderInput {
  userId: string;
  planCode: string;
  amountRub: number;
  idempotencyKey: string;
  providerOrderId: string;
  paymentUrl: string;
  paymentExpiresAt: string;
}

export interface SaveConsentInput {
  userId: string;
  docType: ConsentRecord['docType'];
  version: string;
  source: ConsentRecord['source'];
}

export type StoreKind = 'memory' | 'postgres';

export type StoreHealth =
  | { ok: true }
  | { ok: false; error: string };

export interface BackendStore {
  readonly kind: StoreKind;
  healthCheck(): Promise<StoreHealth>;

  getUserById(userId: string): Promise<UserRecord | null>;
  getUserByEmail(email: string): Promise<UserRecord | null>;
  createUser(input: CreateUserInput): Promise<UserRecord>;
  saveLocalCredentials(userId: string, password: string): Promise<void>;
  verifyLocalCredentials(
    userId: string,
    password: string,
  ): Promise<{ ok: boolean; needsRehash: boolean }>;
  rehashLocalCredentials(userId: string, password: string): Promise<void>;

  getSubscriptionByUserId(userId: string): Promise<SubscriptionRecord | null>;
  getOrderById(orderId: string): Promise<OrderRecord | null>;
  getOrderByProviderOrderId(providerOrderId: string): Promise<OrderRecord | null>;
  createOrder(input: CreateOrderInput): Promise<OrderRecord>;
  getConsentByUserId(userId: string): Promise<ConsentRecord[]>;
  saveUserConsents(inputs: SaveConsentInput[]): Promise<ConsentRecord[]>;
  getActiveZoomLink(room: string): Promise<ZoomLinkRecord | null>;
  upsertZoomLink(
    room: string,
    targetUrl: string,
    status?: ZoomLinkRecord['status'],
  ): Promise<ZoomLinkRecord>;

  listVideos(options?: { includeDrafts?: boolean }): Promise<VideoRecord[]>;
  getVideoById(videoId: string): Promise<VideoRecord | null>;
  upsertVideo(video: Omit<VideoRecord, 'updatedAt'> & { updatedAt?: string }): Promise<VideoRecord>;

  listArticles(
    options?: { includeDrafts?: boolean; access?: ArticleRecord['access'] },
  ): Promise<ArticleRecord[]>;
  getArticleBySlug(slug: string): Promise<ArticleRecord | null>;
  upsertArticle(
    article: Omit<ArticleRecord, 'updatedAt'> & { updatedAt?: string },
  ): Promise<ArticleRecord>;

  listUsers(): Promise<UserRecord[]>;
  listSubscriptions(): Promise<SubscriptionRecord[]>;
  listOrders(): Promise<OrderRecord[]>;
  listPayments(): Promise<PaymentRecord[]>;
  extendSubscription(
    userId: string,
    endsAtIso: string,
    actorUserId: string | null,
  ): Promise<SubscriptionRecord | null>;

  getIdempotencyRecord(key: string): Promise<IdempotencyRecord | null>;
  saveIdempotencyRecord(record: IdempotencyRecord): Promise<IdempotencyRecord>;

  saveRefreshToken(
    record: Omit<RefreshTokenRecord, 'revokedAt' | 'createdAt'>,
  ): Promise<RefreshTokenRecord>;
  getRefreshToken(token: string): Promise<RefreshTokenRecord | null>;
  revokeRefreshToken(token: string): Promise<RefreshTokenRecord | null>;

  recordPaymentEvent(input: RecordPaymentEventInput): Promise<RecordPaymentEventResult>;
  markOrderPaid(orderId: string): Promise<OrderRecord | null>;
  upsertSubscriptionForOrder(order: OrderRecord, paidAtIso: string): Promise<SubscriptionRecord>;
  savePayment(record: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentRecord>;
  saveSubscriptionEvent(
    record: Omit<SubscriptionEventRecord, 'id' | 'createdAt'>,
  ): Promise<SubscriptionEventRecord>;
  saveAudit(record: Omit<AuditRecord, 'id' | 'createdAt'>): Promise<AuditRecord>;
  saveZoomRedirectLog(
    record: Omit<ZoomRedirectLogRecord, 'id' | 'createdAt'>,
  ): Promise<ZoomRedirectLogRecord>;

  runInTransaction<T>(fn: (store: BackendStore) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export class InMemoryBackendStore implements BackendStore {
  public readonly kind: StoreKind = 'memory';
  private readonly users = new Map<string, UserRecord>();
  private readonly usersByEmail = new Map<string, string>();
  private readonly localCredentials = new Map<string, string>();
  private readonly subscriptions = new Map<string, SubscriptionRecord>();
  private readonly orders = new Map<string, OrderRecord>();
  private readonly consentsByUser = new Map<string, ConsentRecord[]>();
  private readonly paymentEventsByDedupKey = new Map<string, PaymentEventRecord>();
  private readonly payments = new Map<string, PaymentRecord>();
  private readonly idempotencyRecords = new Map<string, IdempotencyRecord>();
  private readonly refreshTokens = new Map<string, RefreshTokenRecord>();
  private readonly subscriptionEvents: SubscriptionEventRecord[] = [];
  private readonly zoomLinksByRoom = new Map<string, ZoomLinkRecord>();
  private readonly auditLog: AuditRecord[] = [];
  private readonly zoomRedirectLogs: ZoomRedirectLogRecord[] = [];
  private readonly videos = new Map<string, VideoRecord>();
  private readonly articles = new Map<string, ArticleRecord>();

  constructor() {
    const now = new Date().toISOString();

    for (const video of SEED_VIDEOS) {
      this.videos.set(video.id, video);
    }
    for (const article of SEED_ARTICLES) {
      this.articles.set(article.id, article);
    }

    const demoStudent: UserRecord = {
      id: DEMO_STUDENT_ID,
      email: DEMO_STUDENT_EMAIL,
      role: 'student',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const demoAdmin: UserRecord = {
      id: DEMO_ADMIN_ID,
      email: DEMO_ADMIN_EMAIL,
      role: 'admin',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(demoStudent.id, demoStudent);
    this.usersByEmail.set(demoStudent.email, demoStudent.id);
    this.users.set(demoAdmin.id, demoAdmin);
    this.usersByEmail.set(demoAdmin.email, demoAdmin.id);

    const demoOrder: OrderRecord = {
      id: randomUUID(),
      userId: demoStudent.id,
      planCode: 'club-month',
      amountRub: 600000,
      status: 'pending_payment',
      providerOrderId: DEMO_PROVIDER_ORDER_ID,
      idempotencyKey: null,
      paymentUrl: null,
      paymentExpiresAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(demoOrder.id, demoOrder);

    const demoSubscription: SubscriptionRecord = {
      id: randomUUID(),
      userId: demoStudent.id,
      planCode: 'club-month',
      status: 'active',
      startsAt: now,
      endsAt: addDays(now, 30),
      graceEndsAt: addDays(now, 33),
      manualExtendedUntil: null,
      renewalMode: 'manual',
      updatedAt: now,
    };
    this.subscriptions.set(demoStudent.id, demoSubscription);

    this.zoomLinksByRoom.set('main', {
      id: randomUUID(),
      room: 'main',
      targetUrl: 'https://zoom.us/j/123456789?pwd=replace-me',
      status: 'active',
      updatedAt: now,
    });

    this.consentsByUser.set(demoStudent.id, [
      {
        id: randomUUID(),
        userId: demoStudent.id,
        docType: 'offer',
        version: '1.0.0',
        acceptedAt: now,
        source: 'checkout',
      },
      {
        id: randomUUID(),
        userId: demoStudent.id,
        docType: 'privacy',
        version: '1.0.0',
        acceptedAt: now,
        source: 'checkout',
      },
    ]);
  }

  public async getUserById(userId: string): Promise<UserRecord | null> {
    return this.users.get(userId) ?? null;
  }

  public async getUserByEmail(email: string): Promise<UserRecord | null> {
    const userId = this.usersByEmail.get(email.trim().toLowerCase());
    if (!userId) {
      return null;
    }
    return this.users.get(userId) ?? null;
  }

  public async createUser(input: CreateUserInput): Promise<UserRecord> {
    const now = new Date().toISOString();
    const user: UserRecord = {
      id: input.id ?? randomUUID(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user.id);
    return user;
  }

  public async saveLocalCredentials(userId: string, password: string): Promise<void> {
    this.localCredentials.set(userId, await hashPassword(password));
  }

  public async verifyLocalCredentials(
    userId: string,
    password: string,
  ): Promise<{ ok: boolean; needsRehash: boolean }> {
    const stored = this.localCredentials.get(userId);
    if (!stored) {
      return { ok: false, needsRehash: false };
    }
    return verifyPassword(password, stored);
  }

  public async rehashLocalCredentials(userId: string, password: string): Promise<void> {
    await this.saveLocalCredentials(userId, password);
  }

  public async getSubscriptionByUserId(userId: string): Promise<SubscriptionRecord | null> {
    return this.subscriptions.get(userId) ?? null;
  }

  public async getOrderById(orderId: string): Promise<OrderRecord | null> {
    return this.orders.get(orderId) ?? null;
  }

  public async getOrderByProviderOrderId(providerOrderId: string): Promise<OrderRecord | null> {
    for (const order of this.orders.values()) {
      if (order.providerOrderId === providerOrderId) {
        return order;
      }
    }
    return null;
  }

  public async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    const now = new Date().toISOString();
    const order: OrderRecord = {
      id: randomUUID(),
      userId: input.userId,
      planCode: input.planCode,
      amountRub: input.amountRub,
      status: 'pending_payment',
      providerOrderId: input.providerOrderId,
      idempotencyKey: input.idempotencyKey,
      paymentUrl: input.paymentUrl,
      paymentExpiresAt: input.paymentExpiresAt,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(order.id, order);
    return order;
  }

  public async getConsentByUserId(userId: string): Promise<ConsentRecord[]> {
    return this.consentsByUser.get(userId) ?? [];
  }

  public async saveUserConsents(inputs: SaveConsentInput[]): Promise<ConsentRecord[]> {
    const saved: ConsentRecord[] = [];

    for (const input of inputs) {
      const existing = this.consentsByUser.get(input.userId) ?? [];
      const next: ConsentRecord = {
        id: randomUUID(),
        userId: input.userId,
        docType: input.docType,
        version: input.version,
        acceptedAt: new Date().toISOString(),
        source: input.source,
      };
      existing.push(next);
      this.consentsByUser.set(input.userId, existing);
      saved.push(next);
    }

    return saved;
  }

  public async getActiveZoomLink(room: string): Promise<ZoomLinkRecord | null> {
    const link = this.zoomLinksByRoom.get(room);
    if (!link || link.status !== 'active') {
      return null;
    }
    return link;
  }

  public async upsertZoomLink(
    room: string,
    targetUrl: string,
    status: ZoomLinkRecord['status'] = 'active',
  ): Promise<ZoomLinkRecord> {
    const existing = this.zoomLinksByRoom.get(room);
    const next: ZoomLinkRecord = {
      id: existing?.id ?? randomUUID(),
      room,
      targetUrl,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.zoomLinksByRoom.set(room, next);
    return next;
  }

  public async listVideos(options: { includeDrafts?: boolean } = {}): Promise<VideoRecord[]> {
    return [...this.videos.values()]
      .filter((video) => options.includeDrafts || video.status === 'published')
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  public async getVideoById(videoId: string): Promise<VideoRecord | null> {
    return this.videos.get(videoId) ?? null;
  }

  public async upsertVideo(video: Omit<VideoRecord, 'updatedAt'> & { updatedAt?: string }): Promise<VideoRecord> {
    const next: VideoRecord = {
      ...video,
      updatedAt: video.updatedAt ?? new Date().toISOString(),
    };
    this.videos.set(next.id, next);
    return next;
  }

  public async listArticles(
    options: { includeDrafts?: boolean; access?: ArticleRecord['access'] } = {},
  ): Promise<ArticleRecord[]> {
    return [...this.articles.values()]
      .filter((article) => options.includeDrafts || article.status === 'published')
      .filter((article) => !options.access || article.access === options.access)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  public async getArticleBySlug(slug: string): Promise<ArticleRecord | null> {
    for (const article of this.articles.values()) {
      if (article.slug === slug) {
        return article;
      }
    }
    return null;
  }

  public async upsertArticle(
    article: Omit<ArticleRecord, 'updatedAt'> & { updatedAt?: string },
  ): Promise<ArticleRecord> {
    const next: ArticleRecord = {
      ...article,
      updatedAt: article.updatedAt ?? new Date().toISOString(),
    };
    this.articles.set(next.id, next);
    return next;
  }

  public async listUsers(): Promise<UserRecord[]> {
    return [...this.users.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  public async listSubscriptions(): Promise<SubscriptionRecord[]> {
    return [...this.subscriptions.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  public async listOrders(): Promise<OrderRecord[]> {
    return [...this.orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public async listPayments(): Promise<PaymentRecord[]> {
    return [...this.payments.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public async extendSubscription(
    userId: string,
    endsAtIso: string,
    actorUserId: string | null,
  ): Promise<SubscriptionRecord | null> {
    const existing = this.subscriptions.get(userId);
    if (!existing) {
      return null;
    }

    const next: SubscriptionRecord = {
      ...existing,
      status: 'active',
      endsAt: endsAtIso,
      graceEndsAt: addDays(endsAtIso, 3),
      manualExtendedUntil: endsAtIso,
      updatedAt: new Date().toISOString(),
    };
    this.subscriptions.set(userId, next);
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
    const record = this.idempotencyRecords.get(key);
    if (!record) {
      return null;
    }

    if (Date.parse(record.expiresAt) <= Date.now()) {
      this.idempotencyRecords.delete(key);
      return null;
    }

    return record;
  }

  public async saveIdempotencyRecord(record: IdempotencyRecord): Promise<IdempotencyRecord> {
    this.idempotencyRecords.set(record.key, record);
    return record;
  }

  public async saveRefreshToken(record: Omit<RefreshTokenRecord, 'revokedAt' | 'createdAt'>): Promise<RefreshTokenRecord> {
    const next: RefreshTokenRecord = {
      ...record,
      revokedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.refreshTokens.set(record.token, next);
    return next;
  }

  public async getRefreshToken(token: string): Promise<RefreshTokenRecord | null> {
    return this.refreshTokens.get(token) ?? null;
  }

  public async revokeRefreshToken(token: string): Promise<RefreshTokenRecord | null> {
    const existing = this.refreshTokens.get(token);
    if (!existing) {
      return null;
    }

    const next: RefreshTokenRecord = {
      ...existing,
      revokedAt: new Date().toISOString(),
    };
    this.refreshTokens.set(token, next);
    return next;
  }

  public async recordPaymentEvent(input: RecordPaymentEventInput): Promise<RecordPaymentEventResult> {
    const existingEvent = this.paymentEventsByDedupKey.get(input.dedupKey);
    if (existingEvent) {
      return {
        duplicate: true,
        event: existingEvent,
      };
    }

    const event: PaymentEventRecord = {
      id: randomUUID(),
      dedupKey: input.dedupKey,
      provider: 'prodamus',
      providerPaymentId: input.providerPaymentId,
      providerOrderId: input.providerOrderId,
      eventStatus: input.eventStatus,
      amountRub: input.amountRub,
      signatureValid: input.signatureValid,
      payload: input.payload,
      createdAt: new Date().toISOString(),
    };

    this.paymentEventsByDedupKey.set(input.dedupKey, event);
    return {
      duplicate: false,
      event,
    };
  }

  public async markOrderPaid(orderId: string): Promise<OrderRecord | null> {
    const order = this.orders.get(orderId);
    if (!order) {
      return null;
    }

    const updatedOrder: OrderRecord = {
      ...order,
      status: 'paid',
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(order.id, updatedOrder);
    return updatedOrder;
  }

  public async upsertSubscriptionForOrder(order: OrderRecord, paidAtIso: string): Promise<SubscriptionRecord> {
    const existing = this.subscriptions.get(order.userId);
    const plan = PLAN_CATALOG[order.planCode];
    const durationDays = plan?.durationDays ?? 30;
    const startsAt = paidAtIso;

    const next: SubscriptionRecord = {
      id: existing?.id ?? randomUUID(),
      userId: order.userId,
      planCode: order.planCode,
      status: 'active',
      startsAt,
      endsAt: addDays(startsAt, durationDays),
      graceEndsAt: addDays(startsAt, durationDays + 3),
      manualExtendedUntil: existing?.manualExtendedUntil ?? null,
      renewalMode: 'manual',
      updatedAt: new Date().toISOString(),
    };

    this.subscriptions.set(order.userId, next);
    return next;
  }

  public async savePayment(record: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentRecord> {
    const now = new Date().toISOString();
    const next: PaymentRecord = {
      ...record,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.payments.set(next.id, next);
    return next;
  }

  public async saveSubscriptionEvent(
    record: Omit<SubscriptionEventRecord, 'id' | 'createdAt'>,
  ): Promise<SubscriptionEventRecord> {
    const next: SubscriptionEventRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.subscriptionEvents.push(next);
    return next;
  }

  public async saveAudit(record: Omit<AuditRecord, 'id' | 'createdAt'>): Promise<AuditRecord> {
    const next: AuditRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.auditLog.push(next);
    return next;
  }

  public async saveZoomRedirectLog(record: Omit<ZoomRedirectLogRecord, 'id' | 'createdAt'>): Promise<ZoomRedirectLogRecord> {
    const next: ZoomRedirectLogRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.zoomRedirectLogs.push(next);
    return next;
  }

  public async runInTransaction<T>(fn: (store: BackendStore) => Promise<T>): Promise<T> {
    return fn(this);
  }

  public async healthCheck(): Promise<StoreHealth> {
    return { ok: true };
  }

  public async close(): Promise<void> {
    return;
  }
}

export const buildInMemoryStore = async (): Promise<BackendStore> => {
  const store = new InMemoryBackendStore();
  await store.saveLocalCredentials(DEMO_STUDENT_ID, DEMO_STUDENT_PASSWORD);
  await store.saveLocalCredentials(DEMO_ADMIN_ID, DEMO_ADMIN_PASSWORD);
  return store;
};
