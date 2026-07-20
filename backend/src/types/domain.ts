export const USER_ROLES = ['user', 'student', 'support', 'editor', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserStatus = 'active' | 'blocked' | 'pending_verification';

export type SubscriptionStatus = 'active' | 'grace' | 'expired' | 'suspended' | 'canceled';

export interface UserRecord {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planCode: string;
  status: SubscriptionStatus;
  startsAt: string;
  endsAt: string;
  graceEndsAt: string | null;
  manualExtendedUntil: string | null;
  renewalMode: 'manual';
  updatedAt: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  planCode: string;
  amountRub: number;
  status: 'created' | 'pending_payment' | 'paid' | 'failed' | 'canceled' | 'manual_review';
  providerOrderId: string | null;
  idempotencyKey: string | null;
  paymentUrl: string | null;
  paymentExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  provider: 'prodamus';
  providerPaymentId: string;
  status: 'processing' | 'succeeded' | 'failed' | 'refunded' | 'chargeback';
  amountRub: number;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IdempotencyRecord {
  key: string;
  requestHash: string;
  responseBody: Record<string, unknown>;
  statusCode: number;
  createdAt: string;
  expiresAt: string;
}

export interface RefreshTokenRecord {
  token: string;
  userId: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
}

export interface SubscriptionEventRecord {
  id: string;
  subscriptionId: string;
  eventType: 'activated' | 'renewed' | 'suspended' | 'restored' | 'expired' | 'canceled';
  actorType: 'system' | 'admin' | 'support';
  actorUserId: string | null;
  reason: string | null;
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  docType: 'offer' | 'privacy' | 'refund' | 'medical_disclaimer' | 'cookies';
  version: string;
  acceptedAt: string;
  source: 'checkout' | 'register' | 'profile_update';
}

export interface AuditRecord {
  id: string;
  actorUserId: string | null;
  actorRole: UserRole | 'system';
  action: string;
  entityType: string;
  entityId: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  requestId: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PaymentEventRecord {
  id: string;
  dedupKey: string;
  provider: 'prodamus';
  providerPaymentId: string;
  providerOrderId: string | null;
  eventStatus: 'paid' | 'failed' | 'declined' | 'refunded';
  amountRub: number;
  signatureValid: boolean;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface ZoomLinkRecord {
  id: string;
  room: string;
  targetUrl: string;
  status: 'active' | 'inactive' | 'rotating';
  updatedAt: string;
}

export interface ZoomRedirectLogRecord {
  id: string;
  userId: string | null;
  zoomLinkId: string | null;
  room: string;
  result: 'allowed' | 'denied';
  reason: string;
  ip: string | null;
  userAgent: string | null;
  requestId: string;
  createdAt: string;
}

export type VideoCategory = 'practices' | 'seminars' | 'philosophy' | 'new';
export type ArticleAccess = 'public' | 'club';
export type ArticleCategory = 'open' | 'technique' | 'lifestyle' | 'club-news';

export interface VideoRecord {
  id: string;
  kinescopeId: string;
  title: string;
  description: string;
  category: VideoCategory;
  accessLevel: 'club_active' | 'public';
  durationMin: number;
  status: 'published' | 'draft';
  publishedAt: string;
  updatedAt: string;
}

export interface ArticleRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: ArticleCategory;
  access: ArticleAccess;
  status: 'published' | 'draft';
  publishedAt: string;
  updatedAt: string;
}
