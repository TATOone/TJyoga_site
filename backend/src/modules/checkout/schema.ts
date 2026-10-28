import { z } from 'zod';
import { isAllowedCheckoutReturnUrl } from '../../lib/returnUrl.js';

const consentSchema = z.object({
  doc_type: z.enum(['offer', 'privacy', 'refund', 'medical_disclaimer', 'cookies']),
  version: z.string().min(1),
});

export const checkoutSessionRequestSchema = z.object({
  plan_code: z.string().min(1),
  return_url_success: z
    .string()
    .url()
    .refine(isAllowedCheckoutReturnUrl, 'return_url_success должен быть с разрешённого origin'),
  return_url_error: z
    .string()
    .url()
    .refine(isAllowedCheckoutReturnUrl, 'return_url_error должен быть с разрешённого origin'),
  accept_consents: z.array(consentSchema).min(1),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().min(5).optional(),
  customer_extra: z.string().max(500).optional(),
});

export type CheckoutSessionRequest = z.infer<typeof checkoutSessionRequestSchema>;
