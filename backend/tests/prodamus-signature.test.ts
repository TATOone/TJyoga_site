import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createProdamusRequestSignature } from '../src/modules/payments/prodamus/hmac.js';
import {
  normalizeProdamusWebhookPayload,
  parseWebhookBody,
} from '../src/modules/payments/prodamus/payload.js';
import { extractProdamusPaymentUrl } from '../src/modules/payments/prodamus/paymentUrl.js';
import {
  readProdamusSignatureHeader,
  verifyProdamusSignature,
} from '../src/modules/payments/prodamus/signature.js';

const SECRET = 'payform-secret-key-for-tests';

describe('Prodamus official HMAC (Hmac::verify)', () => {
  it('accepts Sign over POST fields using stringify+sort+JSON+/escape', () => {
    const payload = {
      order_id: 'order-1',
      payment_status: 'success',
      sum: '6000.00',
      customer_email: 'a@example.com',
    };
    const signature = createProdamusRequestSignature(payload, SECRET);

    expect(
      verifyProdamusSignature({
        payload,
        rawBody: 'not-the-signed-raw-body',
        providedSignature: signature,
        secret: SECRET,
        algorithm: 'sha256',
      }),
    ).toBe(true);
  });

  it('reads the official Sign header case-insensitively', () => {
    expect(readProdamusSignatureHeader({ sign: 'abc' }, 'x-prodamus-signature')).toBe('abc');
    expect(readProdamusSignatureHeader({ 'x-prodamus-signature': 'def' }, 'x-prodamus-signature')).toBe(
      'def',
    );
  });

  it('escapes slashes in JSON the way official Prodamus docs require', () => {
    const payload = { urlSuccess: 'https://tjyoga.ru/payment/success' };
    const json = JSON.stringify({ urlSuccess: 'https://tjyoga.ru/payment/success' }).replace(/\//g, '\\/');
    const expected = createHmac('sha256', SECRET).update(json, 'utf8').digest('hex');
    expect(createProdamusRequestSignature(payload, SECRET)).toBe(expected);
    expect(json).toContain('\\/');
  });

  it('rejects a forged signature', () => {
    const payload = { order_id: 'order-1', payment_status: 'success' };
    expect(
      verifyProdamusSignature({
        payload,
        rawBody: JSON.stringify(payload),
        providedSignature: '00'.repeat(32),
        secret: SECRET,
        algorithm: 'sha256',
      }),
    ).toBe(false);
  });

  it('still accepts HMAC of the raw JSON body (legacy tests)', () => {
    const rawBody = JSON.stringify({
      provider_payment_id: 'pdm_1',
      status: 'paid',
      amount_rub: 600000,
    });
    const signature = createHmac('sha256', SECRET).update(rawBody, 'utf8').digest('hex');
    expect(
      verifyProdamusSignature({
        payload: JSON.parse(rawBody) as Record<string, unknown>,
        rawBody,
        providedSignature: signature,
        secret: SECRET,
        algorithm: 'sha256',
      }),
    ).toBe(true);
  });

  it('parses urlencoded Prodamus notifications and maps payment_status=success', () => {
    const rawBody =
      'order_id=987654&order_num=abc&payment_status=success&sum=6000.00&date=2026-10-28+10%3A00%3A00';
    const parsed = parseWebhookBody(undefined, rawBody);
    expect(parsed).toEqual({
      order_id: '987654',
      order_num: 'abc',
      payment_status: 'success',
      sum: '6000.00',
      date: '2026-10-28 10:00:00',
    });
    const normalized = normalizeProdamusWebhookPayload(parsed!);
    expect(normalized.status).toBe('paid');
    expect(normalized.provider_payment_id).toBe('987654');
    expect(normalized.provider_order_id).toBe('abc');
    expect(normalized.amount_rub).toBe(600000);
    expect(normalized.paid_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('nests products[0][...] like PHP $_POST so HMAC matches Hmac::verify', () => {
    const rawBody =
      'order_id=1&payment_status=success&products[0][name]=Club&products[0][price]=6000&products[0][quantity]=1';
    const parsed = parseWebhookBody(undefined, rawBody);
    const nested = {
      order_id: '1',
      payment_status: 'success',
      products: [{ name: 'Club', price: '6000', quantity: '1' }],
    };
    expect(parsed).toEqual(nested);

    const signature = createProdamusRequestSignature(nested, SECRET);
    expect(
      verifyProdamusSignature({
        payload: parsed,
        rawBody,
        providedSignature: signature,
        secret: SECRET,
        algorithm: 'sha256',
      }),
    ).toBe(true);
  });
});

describe('extractProdamusPaymentUrl', () => {
  const requestUrl = 'https://payform.ru/t5a23mO/';

  it('reads a raw text URL body', () => {
    expect(
      extractProdamusPaymentUrl({ location: null, body: 'https://payform.ru/u8zDE/\n' }, requestUrl),
    ).toBe('https://payform.ru/u8zDE/');
  });

  it('reads 302 Location onto the invoice payform', () => {
    expect(
      extractProdamusPaymentUrl(
        {
          location: 'https://online-yogatj.payform.ru/?invoice_id=abc&paylink=1',
          body: '<html>redirect</html>',
        },
        requestUrl,
      ),
    ).toBe('https://online-yogatj.payform.ru/?invoice_id=abc&paylink=1');
  });

  it('reads meta-refresh URL when Location is missing', () => {
    const body =
      '<html><head><meta http-equiv="refresh" content="0;url=https://online-yogatj.payform.ru/?invoice_id=abc&amp;paylink=1"></head></html>';
    expect(extractProdamusPaymentUrl({ location: null, body }, requestUrl)).toBe(
      'https://online-yogatj.payform.ru/?invoice_id=abc&paylink=1',
    );
  });
});
