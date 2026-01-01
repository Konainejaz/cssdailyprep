import { createHmac } from 'node:crypto';
import { getSupabaseClient, getSupabaseAdmin } from '../../_lib/supabase';

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

const toTxnDateTime = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

const getConfig = () => {
  const env = (process.env.JAZZCASH_ENV || process.env.JAZZCASH_ENVIRONMENT || 'sandbox').toLowerCase();
  const isSandbox = env !== 'production' && env !== 'live';
  const merchantId = normalizeEnvValue(process.env.JAZZCASH_MERCHANT_ID);
  const password = normalizeEnvValue(process.env.JAZZCASH_PASSWORD);
  const integritySalt = normalizeEnvValue(process.env.JAZZCASH_INTEGRITY_SALT);
  const returnUrl = normalizeEnvValue(process.env.JAZZCASH_RETURN_URL);
  const bankId = normalizeEnvValue(process.env.JAZZCASH_BANK_ID) || 'TBANK';
  const productId = normalizeEnvValue(process.env.JAZZCASH_PRODUCT_ID) || 'RETL';
  const endpoint =
    normalizeEnvValue(process.env.JAZZCASH_ENDPOINT) ||
    (isSandbox
      ? 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform'
      : 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform');

  if (!merchantId || !password || !integritySalt || !returnUrl) {
    throw new Error('Missing JazzCash configuration');
  }

  return { merchantId, password, integritySalt, returnUrl, bankId, productId, endpoint, isSandbox };
};

const resolvePlan = (planId: string) => {
  if (planId === 'premium') return { planId: 'premium', amountPkr: 1600 };
  return { planId: 'basic', amountPkr: 1000 };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const supabase = getSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { planId } = req.body ?? {};
    const resolved = resolvePlan(String(planId ?? 'premium'));
    const cfg = getConfig();

    const txnDateTime = toTxnDateTime(new Date());
    const expiry = toTxnDateTime(new Date(Date.now() + 60 * 60 * 1000));
    const txnRefNo = `T${txnDateTime}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`.slice(0, 20);
    const amount = String(resolved.amountPkr * 100);

    const fields: Record<string, string> = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: cfg.merchantId,
      pp_SubMerchantID: '',
      pp_Password: cfg.password,
      pp_BankID: cfg.bankId,
      pp_ProductID: cfg.productId,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amount,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: `${resolved.planId}-${user.id}`.slice(0, 20),
      pp_Description: `${resolved.planId.toUpperCase()} plan`,
      pp_TxnExpiryDateTime: expiry,
      pp_ReturnURL: cfg.returnUrl,
      ppmpf_1: user.email || '',
      ppmpf_2: resolved.planId,
      ppmpf_3: user.id,
      ppmpf_4: '',
      ppmpf_5: '',
    };

    const secureHash = buildSecureHash(fields, cfg.integritySalt);
    fields.pp_SecureHash = secureHash;

    const admin = getSupabaseAdmin();
    await admin.from('payments').insert({
      user_id: user.id,
      plan_id: resolved.planId,
      amount_pkr: resolved.amountPkr,
      gateway: 'jazzcash',
      status: 'pending',
      txn_ref: txnRefNo,
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({ actionUrl: cfg.endpoint, fields });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
