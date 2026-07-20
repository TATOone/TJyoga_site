import { z } from 'zod';

export const prodamusWebhookPayloadSchema = z.object({
  provider_payment_id: z.string().min(1),
  provider_order_id: z.string().min(1).nullable().optional(),
  status: z.enum(['paid', 'failed', 'declined', 'refunded']),
  amount_rub: z.coerce.number().int().nonnegative(),
  paid_at: z.string().datetime().optional(),
  raw: z.record(z.string(), z.unknown()).optional(),
});

export type ProdamusWebhookPayload = z.infer<typeof prodamusWebhookPayloadSchema>;
