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

export interface BackendStore {
  getUserById(userId: string): UserRecord | null;
  getUserByEmail(email: string): UserRecord | null;
  createUser(input: CreateUserInput): UserRecord;
  saveLocalCredentials(userId: string, password: string): Promise<void>;
  verifyLocalCredentials(
    userId: string,
    password: string,
  ): Promise<{ ok: boolean; needsRehash: boolean }>;
  rehashLocalCredentials(userId: string, password: string): Promise<void>;

  getSubscriptionByUserId(userId: string): SubscriptionRecord | null;
  getOrderById(orderId: string): OrderRecord | null;
  getOrderByProviderOrderId(providerOrderId: string): OrderRecord | null;
  createOrder(input: CreateOrderInput): OrderRecord;
  getConsentByUserId(userId: string): ConsentRecord[];
  saveUserConsents(inputs: SaveConsentInput[]): ConsentRecord[];
  getActiveZoomLink(room: string): ZoomLinkRecord | null;
  upsertZoomLink(room: string, targetUrl: string, status?: ZoomLinkRecord['status']): ZoomLinkRecord;

  listVideos(options?: { includeDrafts?: boolean }): VideoRecord[];
  getVideoById(videoId: string): VideoRecord | null;
  upsertVideo(video: Omit<VideoRecord, 'updatedAt'> & { updatedAt?: string }): VideoRecord;

  listArticles(options?: { includeDrafts?: boolean; access?: ArticleRecord['access'] }): ArticleRecord[];
  getArticleBySlug(slug: string): ArticleRecord | null;
  upsertArticle(article: Omit<ArticleRecord, 'updatedAt'> & { updatedAt?: string }): ArticleRecord;

  listUsers(): UserRecord[];
  listSubscriptions(): SubscriptionRecord[];
  listOrders(): OrderRecord[];
  listPayments(): PaymentRecord[];
  extendSubscription(
    userId: string,
    endsAtIso: string,
    actorUserId: string | null,
  ): SubscriptionRecord | null;

  getIdempotencyRecord(key: string): IdempotencyRecord | null;
  saveIdempotencyRecord(record: IdempotencyRecord): IdempotencyRecord;

  saveRefreshToken(record: Omit<RefreshTokenRecord, 'revokedAt' | 'createdAt'>): RefreshTokenRecord;
  getRefreshToken(token: string): RefreshTokenRecord | null;
  revokeRefreshToken(token: string): RefreshTokenRecord | null;

  recordPaymentEvent(input: RecordPaymentEventInput): RecordPaymentEventResult;
  markOrderPaid(orderId: string): OrderRecord | null;
  upsertSubscriptionForOrder(order: OrderRecord, paidAtIso: string): SubscriptionRecord;
  savePayment(record: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): PaymentRecord;
  saveSubscriptionEvent(
    record: Omit<SubscriptionEventRecord, 'id' | 'createdAt'>,
  ): SubscriptionEventRecord;
  saveAudit(record: Omit<AuditRecord, 'id' | 'createdAt'>): AuditRecord;
  saveZoomRedirectLog(record: Omit<ZoomRedirectLogRecord, 'id' | 'createdAt'>): ZoomRedirectLogRecord;
}

const addDays = (dateIso: string, days: number): string => {
  const date = new Date(dateIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

export class InMemoryBackendStore implements BackendStore {
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
      id: '00000000-0000-4000-8000-000000000002',
      email: 'student@example.com',
      role: 'student',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const demoAdmin: UserRecord = {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'admin@example.com',
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
      providerOrderId: 'order_abc',
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

  public getUserById(userId: string): UserRecord | null {
    return this.users.get(userId) ?? null;
  }

  public getUserByEmail(email: string): UserRecord | null {
    const userId = this.usersByEmail.get(email.trim().toLowerCase());
    if (!userId) {
      return null;
    }
    return this.users.get(userId) ?? null;
  }

  public createUser(input: CreateUserInput): UserRecord {
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

  public getSubscriptionByUserId(userId: string): SubscriptionRecord | null {
    return this.subscriptions.get(userId) ?? null;
  }

  public getOrderById(orderId: string): OrderRecord | null {
    return this.orders.get(orderId) ?? null;
  }

  public getOrderByProviderOrderId(providerOrderId: string): OrderRecord | null {
    for (const order of this.orders.values()) {
      if (order.providerOrderId === providerOrderId) {
        return order;
      }
    }
    return null;
  }

  public createOrder(input: CreateOrderInput): OrderRecord {
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

  public getConsentByUserId(userId: string): ConsentRecord[] {
    return this.consentsByUser.get(userId) ?? [];
  }

  public saveUserConsents(inputs: SaveConsentInput[]): ConsentRecord[] {
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

  public getActiveZoomLink(room: string): ZoomLinkRecord | null {
    const link = this.zoomLinksByRoom.get(room);
    if (!link || link.status !== 'active') {
      return null;
    }
    return link;
  }

  public upsertZoomLink(
    room: string,
    targetUrl: string,
    status: ZoomLinkRecord['status'] = 'active',
  ): ZoomLinkRecord {
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

  public listVideos(options: { includeDrafts?: boolean } = {}): VideoRecord[] {
    return [...this.videos.values()]
      .filter((video) => options.includeDrafts || video.status === 'published')
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  public getVideoById(videoId: string): VideoRecord | null {
    return this.videos.get(videoId) ?? null;
  }

  public upsertVideo(video: Omit<VideoRecord, 'updatedAt'> & { updatedAt?: string }): VideoRecord {
    const next: VideoRecord = {
      ...video,
      updatedAt: video.updatedAt ?? new Date().toISOString(),
    };
    this.videos.set(next.id, next);
    return next;
  }

  public listArticles(
    options: { includeDrafts?: boolean; access?: ArticleRecord['access'] } = {},
  ): ArticleRecord[] {
    return [...this.articles.values()]
      .filter((article) => options.includeDrafts || article.status === 'published')
      .filter((article) => !options.access || article.access === options.access)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  public getArticleBySlug(slug: string): ArticleRecord | null {
    for (const article of this.articles.values()) {
      if (article.slug === slug) {
        return article;
      }
    }
    return null;
  }

  public upsertArticle(
    article: Omit<ArticleRecord, 'updatedAt'> & { updatedAt?: string },
  ): ArticleRecord {
    const next: ArticleRecord = {
      ...article,
      updatedAt: article.updatedAt ?? new Date().toISOString(),
    };
    this.articles.set(next.id, next);
    return next;
  }

  public listUsers(): UserRecord[] {
    return [...this.users.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  public listSubscriptions(): SubscriptionRecord[] {
    return [...this.subscriptions.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  public listOrders(): OrderRecord[] {
    return [...this.orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public listPayments(): PaymentRecord[] {
    return [...this.payments.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public extendSubscription(
    userId: string,
    endsAtIso: string,
    actorUserId: string | null,
  ): SubscriptionRecord | null {
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
    this.saveSubscriptionEvent({
      subscriptionId: next.id,
      eventType: 'renewed',
      actorType: actorUserId ? 'admin' : 'system',
      actorUserId,
      reason: 'manual_extend',
    });
    return next;
  }

  public getIdempotencyRecord(key: string): IdempotencyRecord | null {
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

  public saveIdempotencyRecord(record: IdempotencyRecord): IdempotencyRecord {
    this.idempotencyRecords.set(record.key, record);
    return record;
  }

  public saveRefreshToken(record: Omit<RefreshTokenRecord, 'revokedAt' | 'createdAt'>): RefreshTokenRecord {
    const next: RefreshTokenRecord = {
      ...record,
      revokedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.refreshTokens.set(record.token, next);
    return next;
  }

  public getRefreshToken(token: string): RefreshTokenRecord | null {
    return this.refreshTokens.get(token) ?? null;
  }

  public revokeRefreshToken(token: string): RefreshTokenRecord | null {
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

  public recordPaymentEvent(input: RecordPaymentEventInput): RecordPaymentEventResult {
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

  public markOrderPaid(orderId: string): OrderRecord | null {
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

  public upsertSubscriptionForOrder(order: OrderRecord, paidAtIso: string): SubscriptionRecord {
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

  public savePayment(record: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): PaymentRecord {
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

  public saveSubscriptionEvent(
    record: Omit<SubscriptionEventRecord, 'id' | 'createdAt'>,
  ): SubscriptionEventRecord {
    const next: SubscriptionEventRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.subscriptionEvents.push(next);
    return next;
  }

  public saveAudit(record: Omit<AuditRecord, 'id' | 'createdAt'>): AuditRecord {
    const next: AuditRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.auditLog.push(next);
    return next;
  }

  public saveZoomRedirectLog(record: Omit<ZoomRedirectLogRecord, 'id' | 'createdAt'>): ZoomRedirectLogRecord {
    const next: ZoomRedirectLogRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.zoomRedirectLogs.push(next);
    return next;
  }
}

export const buildInMemoryStore = async (): Promise<BackendStore> => {
  const store = new InMemoryBackendStore();
  await store.saveLocalCredentials('00000000-0000-4000-8000-000000000002', 'student-demo-pass');
  await store.saveLocalCredentials('00000000-0000-4000-8000-000000000001', 'admin-demo-pass');
  return store;
};
