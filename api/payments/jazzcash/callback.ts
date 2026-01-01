import { createHmac } from 'node:crypto';
import * as querystring from 'node:querystring';
import { getSupabaseAdmin } from '../../_lib/supabase';

const normalizeEnvValue = (value?: string) => (value ?? '').trim().replace(/^['"`]/, '').replace(/['"`]$/, '');

const buildSecureHash = (fields: Record<string, string>, integritySalt: string) => {
  const sortedKeys = Object.keys(fields)
    .filter((k) => k !== 'pp_SecureHash')
    .sort();

  let str = integritySalt;
  for (const key of sortedKeys) {
    const value = fields[key];
    if (value === undefined || value === null) continue;
    const trimmed = String(value).trim();
    if (!trimmed) continue;
    str += `&${trimmed}`;
  }

  return createHmac('sha256', integritySalt).update(str).digest('hex').toUpperCase();
};

const getIntegritySalt = () => {
  const salt = normalizeEnvValue(process.env.JAZZCASH_INTEGRITY_SALT);
  if (!salt) throw new Error('Missing JazzCash integrity salt');
  return salt;
};

const readRawBody = (req): Promise<string> =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const parseBody = async (req): Promise<Record<string, string>> => {
  if (req.body && typeof req.body === 'object') {
    const obj: Record<string, any> = req.body;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = typeof v === 'string' ? v : String(v ?? '');
    return out;
  }

  if (typeof req.body === 'string') {
    const parsed = querystring.parse(req.body);
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) out[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '');
    return out;
  }

  const raw = await readRawBody(req);
  if (!raw) return {};
  const parsed = querystring.parse(raw);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) out[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '');
  return out;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const payload = await parseBody(req);
    const integritySalt = getIntegritySalt();

    const expectedHash = buildSecureHash(payload, integritySalt);
    const receivedHash = String(payload.pp_SecureHash ?? '').toUpperCase();
    const hashOk = expectedHash === receivedHash;

    const txnRefNo = String(payload.pp_TxnRefNo ?? '');
    const responseCode = String(payload.pp_ResponseCode ?? '');
    const responseMessage = String(payload.pp_ResponseMessage ?? '');
    const retrivalRef = String(payload.pp_RetreivalReferenceNo ?? payload.pp_RetreivalReferenceNo ?? '');
    const planId = String(payload.ppmpf_2 ?? '');
    const userId = String(payload.ppmpf_3 ?? '');

    const admin = getSupabaseAdmin();

    const status = hashOk && responseCode === '000' ? 'success' : 'failed';

    if (txnRefNo) {
      await admin
        .from('payments')
        .update({
          status,
          response_code: responseCode || null,
          response_message: responseMessage || null,
          retrival_ref: retrivalRef || null,
          raw: payload,
          updated_at: new Date().toISOString(),
        })
        .eq('txn_ref', txnRefNo);
    }

    if (status === 'success' && userId) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await admin
        .from('profiles')
        .update({
          plan_id: planId === 'premium' ? 'premium' : 'basic',
          plan_status: 'active',
          plan_started_at: now.toISOString(),
          plan_expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', userId);
    }

    const successRedirect = normalizeEnvValue(process.env.JAZZCASH_SUCCESS_REDIRECT) || '/';
    const failRedirect = normalizeEnvValue(process.env.JAZZCASH_FAIL_REDIRECT) || '/';
    const target = status === 'success' ? successRedirect : failRedirect;

    return res
      .status(302)
      .setHeader('Location', `${target}?payment=${status}&ref=${encodeURIComponent(txnRefNo || '')}`)
      .end();
  } catch (error: any) {
    return res.status(500).send(error.message || 'Callback error');
  }
}
