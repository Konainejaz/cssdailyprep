import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';
import * as querystring from 'node:querystring';
import Groq from 'groq-sdk';

const normalizeEnvValue = (value?: string) => (value ?? '').trim().replace(/^['"`]/, '').replace(/['"`]$/, '');

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Key');
  }

  return { supabaseUrl, supabaseAnonKey, supabaseServiceKey };
};

const getSupabaseClient = (req: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

const getSupabaseAdmin = () => {
  const { supabaseUrl, supabaseServiceKey } = getSupabaseConfig();
  if (!supabaseServiceKey) throw new Error('Missing Supabase URL or Service Key');
  return createClient(supabaseUrl, supabaseServiceKey);
};

const getSegments = (req: any): string[] => {
  const q = req?.query?.route ?? req?.query?.path;
  if (Array.isArray(q)) return q.map(String).filter(Boolean);
  if (typeof q === 'string') return q.split('/').filter(Boolean);

  const host = req?.headers?.host || 'localhost';
  const url = new URL(req?.url || '/', `http://${host}`);
  const pathname = url.pathname || '';
  const trimmed = pathname.replace(/^\/api\/?/, '').replace(/^\//, '');
  return trimmed ? trimmed.split('/').filter(Boolean) : [];
};

const readRawBody = (req: any): Promise<string> =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const parseMaybeFormBody = async (req: any): Promise<Record<string, string>> => {
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

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL_ID = 'llama-3.1-8b-instant';

const cleanText = (text: any) => {
  if (!text) return '';
  return String(text).replace(/\\u([\d\w]{4})/gi, (_match, grp) => {
    return String.fromCharCode(parseInt(grp, 16));
  });
};

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

const getJazzCashConfig = () => {
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

const handleMe = async (req: any, res: any) => {
  const supabase = getSupabaseClient(req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { full_name, bio, avatar_url } = req.body;
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name,
          bio,
          avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

const handleNotes = async (req: any, res: any) => {
  const supabase = getSupabaseClient(req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('notes').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      const formattedNotes = (data ?? []).map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: new Date(note.created_at).getTime(),
        updatedAt: new Date(note.updated_at).getTime(),
        subject: note.subject,
        linkedArticleId: note.linked_article_id,
      }));
      return res.status(200).json(formattedNotes);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, content, subject, linkedArticleId, createdAt } = req.body;

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title,
          content,
          subject,
          linked_article_id: linkedArticleId,
          created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        id: data.id,
        title: data.title,
        content: data.content,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        subject: data.subject,
        linkedArticleId: data.linked_article_id,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

const handleNoteById = async (req: any, res: any, id: string) => {
  const supabase = getSupabaseClient(req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'PUT') {
    try {
      const { title, content, subject, linkedArticleId } = req.body;

      const { data, error } = await supabase
        .from('notes')
        .update({
          title,
          content,
          subject,
          linked_article_id: linkedArticleId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        id: data.id,
        title: data.title,
        content: data.content,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        subject: data.subject,
        linkedArticleId: data.linked_article_id,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ message: 'Note deleted' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

const handleHistory = async (req: any, res: any) => {
  const supabase = getSupabaseClient(req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase.from('search_history').delete().eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { query, type, resultSnapshot } = req.body;
      const { error } = await supabase.from('search_history').insert({
        user_id: user.id,
        query,
        type,
        result_snapshot: resultSnapshot,
      });
      if (error) throw error;
      return res.status(201).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

const handleLogs = async (req: any, res: any) => {
  const supabase = getSupabaseClient(req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    try {
      const { action, entityType, entityId, metadata } = req.body;
      const { error } = await supabase.from('user_logs').insert({
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
      });
      if (error) throw error;
      return res.status(201).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

const requireAdmin = async (supabase: any, userId: string) => {
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return profile?.role === 'admin';
};

const handleAdminUsers = async (req: any, res: any) => {
  const supabase = getSupabaseClient(req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await requireAdmin(supabase, user.id))) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

const handleAdminUserRole = async (req: any, res: any, id: string) => {
  const supabase = getSupabaseClient(req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await requireAdmin(supabase, user.id))) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'PATCH') {
    try {
      const { role } = req.body;
      if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

      const { data, error } = await supabase.from('profiles').update({ role }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

const handleJazzCashInitiate = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const supabase = getSupabaseClient(req);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { planId } = req.body ?? {};
    const resolved = resolvePlan(String(planId ?? 'premium'));
    const cfg = getJazzCashConfig();

    const txnDateTime = toTxnDateTime(new Date());
    const expiry = toTxnDateTime(new Date(Date.now() + 60 * 60 * 1000));
    const txnRefNo = `T${txnDateTime}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`.slice(0, 20);
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
};

const getIntegritySalt = () => {
  const salt = normalizeEnvValue(process.env.JAZZCASH_INTEGRITY_SALT);
  if (!salt) throw new Error('Missing JazzCash integrity salt');
  return salt;
};

const handleJazzCashCallback = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const payload = await parseMaybeFormBody(req);
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
};

const handleAiDailyArticles = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { subject, count = 6 } = req.body;

  const subjectGuidelines = (() => {
    if (subject === 'All Subjects') {
      return `Formatting: Provide a diverse mix of articles: 2 from Pakistan Affairs, 2 from International Relations, and 2 from Current Affairs/Economy. Ensure a balanced perspective relevant to CSS exams.`;
    }
    return `Formatting: Use clear sections with headings, provide brief references, and keep content actionable for CSS preparation.`;
  })();

  const prompt = `
    Act as a highly experienced CSS (Central Superior Services) exam mentor in Pakistan.
    Create a daily digest of ${count} distinct, high-quality articles for the subject: "${subject}".
    
    The content must be strictly relevant to "${subject}" (or General CSS Topics if 'All Subjects') and:
    1. Current affairs affecting Pakistan (last 12 months) related to this subject.
    2. Core syllabus concepts for CSS specific to "${subject}".
    3. Critical analysis of recent events.
    
    Each article must have:
    - A professional title.
    - A concise summary (2 sentences).
    - A rich body content (Markdown formatted) that is informative. If the subject is Essay, ensure minimum 300 words; otherwise target at least 180–250 words.
    - A simulated "Source" (e.g., "DAWN", "The News", "Foreign Policy", "The Economist").
    - Estimated read time.
    - Tags (max 3).
    
    Additional formatting requirements for "${subject}": ${subjectGuidelines}
    
    Return a strict JSON object with a single key "articles" containing an array of article objects.
    Each article object should have keys: title, summary, content, source, readTime, tags.
    Ensure all strings are properly escaped for JSON.
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL_ID,
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '{"articles": []}';
    const data = JSON.parse(responseText);
    const articlesRaw = data.articles || [];

    const articles = articlesRaw.map((item: any, index: number) => ({
      ...item,
      title: cleanText(item.title),
      summary: cleanText(item.summary),
      content: cleanText(item.content),
      source: cleanText(item.source),
      id: `${String(subject || '').replace(/\s/g, '')}-${Date.now()}-${index}`,
      subject: subject,
      date: new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }),
    }));

    return res.status(200).json(articles);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

const generateQuiz = async (subject: any, difficulty: any, count: any) => {
  const promptSubject =
    subject === 'All Compulsory Subjects'
      ? 'Compulsory Subjects (English Essay, English Precis & Composition, General Science & Ability, Current Affairs, Pakistan Affairs, Islamiat OR Comparative Religions)'
      : subject === 'All Optional Subjects'
        ? 'Optional Subjects (IR, Pol Science, Gender Studies)'
        : subject;

  const prompt = `
    Create a Mock Exam (Quiz) of ${count} Multiple Choice Questions (MCQs) for the CSS subject: "${promptSubject}".
    Difficulty Level: ${difficulty}.
    
    Questions should be RANDOM and diverse.
    ${String(subject).includes('All') ? 'Ensure a mix of questions from the different included subjects.' : ''}
    
    Return a strict JSON object with a single key "questions" containing an array of question objects.
    Each question object must have:
    - id (integer)
    - question (string)
    - options (array of 4 strings)
    - correctAnswerIndex (integer 0-3)
    - explanation (string)
    - subject (string, the specific subject this question belongs to. e.g. "Pak Affairs")
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL_ID,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content || '{"questions": []}';
  const data = JSON.parse(responseText);
  let generatedQuestions = data.questions || [];

  generatedQuestions = generatedQuestions.map((q: any) => ({
    ...q,
    subject: q.subject || subject,
    difficulty: difficulty,
  }));

  return generatedQuestions;
};

const handleAiQuiz = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { subject, difficulty, count = 10 } = req.body;
  if (!subject || !difficulty) return res.status(400).json({ error: 'Subject and difficulty are required' });

  try {
    const questions = await generateQuiz(subject, difficulty, count);
    return res.status(200).json(questions);
  } catch {
    return res.status(500).json({ error: 'Failed to generate quiz' });
  }
};

const fetchStudyMaterial = async (type: any, promptText: any) => {
  let systemPrompt = '';

  switch (type) {
    case 'TIMELINE':
      systemPrompt = `You are a historian and Central Superior Services (CSS) exam expert. Create a comprehensive timeline of events based on the request.
      Return a strict JSON object with a key "items" containing an array of at least 15 objects.
      Each object must have: 
      - "id" (string, unique)
      - "date" (string)
      - "title" (string)
      - "description" (string, max 30 words)
      - "category" (string)
      - "content" (string, detailed summary approx 100 words)
      - "source" (string)
      - "tags" (array of strings)`;
      break;
    case 'TIMELINE_DETAIL':
      systemPrompt = `You are a Central Superior Services (CSS) Current Affairs expert. Provide a comprehensive detailed analysis for the given event.
      Return a strict JSON object with a key "details" object.
      The object must have:
      - "content" (string, markdown formatted, MINIMUM 1000 WORDS. Must cover: Introduction, Historical Background, Key Events, Implications for Pakistan & Global Politics, Critical Analysis, Conclusion. Do NOT use nested objects, just one long markdown string.)
      - "imagePrompt" (string, description for an image representing the event)
      - "imageKeyword" (string, a single precise English keyword to generate an image, e.g. "Diplomacy", "War", "Economy")
      - "source" (string)
      - "tags" (array of strings)`;
      break;
    case 'VOCAB':
      systemPrompt = `You are an English language expert for Central Superior Services (CSS) exams. Provide advanced vocabulary words.
      Return a strict JSON object with a key "items" containing an array of objects.
      Each object must have: "word" (string), "meaning" (string), "sentence" (string), "type" (string, e.g., Noun, Verb).`;
      break;
    case 'ESSAY':
      systemPrompt = `You are a Central Superior Services (CSS) Essay expert. Provide essay topics and outlines.
      Return a strict JSON object with a key "items" containing an array of objects.
      Each object must have: 
      - "id" (string, unique)
      - "title" (string)
      - "outline" (array of strings representing main points).`;
      break;
    case 'ESSAY_DETAIL':
      systemPrompt = `You are a Central Superior Services (CSS) Essay expert. Write a MONUMENTAL, ACADEMIC MASTERPIECE based on the title and outline provided.
      
      Requirements:
      1. **EXTREME LENGTH**: The essay MUST be at least 2500-3000 words. Do not hold back. Expand every point exhaustively.
      2. **Structure**: 
         - **Introduction**: 2-3 paragraphs ending with a strong thesis.
         - **Body**: 15-20 paragraphs. Each must have a clear topic sentence, evidence, critical analysis, and transition.
         - **Conclusion**: 2-3 paragraphs synthesizing arguments.
      3. **Tone**: Highly formal, academic, and sophisticated vocabulary. No conversational fillers.
      4. **Formatting**: 
         - Use Markdown headers (##) for main sections. 
         - Use **bold** for key terms.
         - Ensure paragraphs are long and detailed.
      5. **Content**:
         - DO NOT simply reprint the outline.
         - DO NOT write "Here is the essay...".
         - START DIRECTLY with the Introduction.
         - Ensure the content is the FULL ESSAY text, not a summary.
      
      Return a strict JSON object with a key "content". 
      IMPORTANT: The value of "content" must be a SINGLE string containing the entire markdown text. Do NOT return an object or array for "content".`;
      break;
    case 'ISLAMIAT':
      systemPrompt = `You are an Islamic Scholar and Central Superior Services (CSS) expert. Provide a curated list of KEY Quranic verses and Hadiths essential for major CSS Islamiat topics (e.g., Governance, Human Rights, Women's Rights, Social Justice, Tauheed, Risalat).
      
      CRITICAL REQUIREMENT:
      The "arabic" field MUST contain ONLY pure Arabic text (UTF-8).
      - ABSOLUTELY NO English characters, numbers, punctuation like "rdf.", or formatting symbols in the "arabic" field.
      - If you are not 100% sure of the exact Arabic text, do not invent it.
      
      Return a strict JSON object with a key "items" containing an array of objects.
      Each object must have: 
      - "arabic" (string, ONLY ARABIC CHARACTERS. Example: "الله نور السماوات والأرض")
      - "translation" (string, clear and eloquent English)
      - "reference" (string, e.g., "Surah Al-Baqarah 2:256" or "Sahih Bukhari, Book of Knowledge")
      - "context" (string, specifically explaining which CSS topics this verse/hadith can be quoted in and why).`;
      break;
    case 'ISLAMIAT_DETAIL':
      systemPrompt = `You are an Islamic Scholar and Central Superior Services (CSS) expert. Provide a detailed analysis of the given verse/Hadith specifically for CSS exams.
      Return a strict JSON object with a key "details" object.
      The object must have:
      - "analysis" (string, detailed explanation of the verse/hadith. If quoting Arabic, use UTF-8 characters, NOT unicode escapes)
      - "cssRelevance" (string, how to quote this in essays, ISLAMIAT, or current affairs papers)
      - "relatedTopics" (array of strings, e.g. "Human Rights", "Women's Rights", "Governance")
      - "keyTakeaways" (array of strings, bullet points for memorization)`;
      break;
  }

  const fullPrompt = `
    ${systemPrompt}
    
    User Request: "${promptText}"
    
    Ensure the response is valid JSON.
  `;

  const targetModel = type === 'ISLAMIAT' || type === 'ISLAMIAT_DETAIL' ? 'llama-3.3-70b-versatile' : MODEL_ID;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: fullPrompt }],
    model: targetModel,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content || '{"items": []}';
  const data = JSON.parse(responseText);

  if (type === 'TIMELINE_DETAIL') return data.details || {};
  if (type === 'ESSAY_DETAIL') return data.content || '';
  if (type === 'ISLAMIAT_DETAIL') return data.details || {};

  if (type === 'ISLAMIAT') {
    const items = data.items || [];
    return items.map((item: any) => ({
      ...item,
      arabic: item.arabic ? String(item.arabic).replace(/[a-zA-Z]/g, '') : item.arabic,
    }));
  }

  return data.items || [];
};

const handleAiStudyMaterial = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { type, prompt } = req.body;
  if (!type || !prompt) return res.status(400).json({ error: 'Type and prompt are required' });

  try {
    const result = await fetchStudyMaterial(type, prompt);
    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch study material' });
  }
};

const researchTopic = async (query: any) => {
  const prompt = `
    Research the following topic for a Central Superior Services (CSS) exam student in Pakistan. 
    
    CRITICAL CONTEXT INSTRUCTIONS:
    1. STRICTLY EXCLUDE any information related to "Cascading Style Sheets" (web development), HTML, CSS coding, or programming.
    2. Focus ONLY on the Civil Service/Competitive Exam system in Pakistan conducted by FPSC.
    3. Ensure all content is relevant to Pakistan's administrative services, government structure, or current affairs as per the CSS syllabus.

    Provide a comprehensive, fact-based answer with recent data, critical analysis, and relevance to the CSS syllabus. 
    Topic: "${query}"
    
    Since you cannot browse the live web, provide the best possible information from your training data.
    Also, list 3-5 credible sources (books, newspapers, reports) that would be relevant to this topic.
    
    Formatting rules based on topic type:
    - If the topic is an Essay or debate-style prompt: write a properly structured essay (Introduction, Body, Conclusion) with at least 300 words.
    - If the topic concerns Islamiat or Islamic studies: include Qur'anic and Hadith context with citations (Surah:Ayah; Book & Hadith number if known), remain respectful and scholarly.
    - If the topic concerns Current Affairs: include at least 3 recent (≤12 months) data points and cite sources.
    - Otherwise: target 200–300 words with clear sections and concise references.
    
    Return a strict JSON object with:
    1. "content": The comprehensive research answer in Markdown format. Use standard Markdown. Escape any double quotes inside the content string with a backslash.
    2. "sources": An array of objects, each with "title" (name of source) and "url" (URL or citation string).
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL_ID,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content || '{}';
  const data = JSON.parse(responseText);

  return {
    query,
    content: data.content || 'No content generated.',
    sources: data.sources || [],
  };
};

const researchWithImages = async (query: any, images: any[]) => {
  const prompt = `
    Analyze the provided images and the user's query: "${query}"
    
    Context: You are a Central Superior Services (CSS) exam mentor in Pakistan.
    
    1. Analyze the images in detail (look for charts, text, maps, or relevant visual data).
    2. Integrate the visual findings with the user's query.
    3. Provide a structured research output relevant to CSS subjects (Current Affairs, Pak Affairs, IR, etc.).
    
    Return a strict JSON object with:
    1. "content": A comprehensive Markdown analysis merging image insights and query context.
    2. "sources": Array of likely sources or references.
    3. "mindMap": A hierarchical structure representing the key concepts.
       - Root node: Main topic
       - Children: Subtopics/Findings
       - Each node has: "id" (unique string), "label" (short title), "details" (brief explanation), "children" (array of nodes).
  `;

  const messages: any = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        ...(images || []).map((img: any) => ({
          type: 'image_url',
          image_url: { url: img, detail: 'auto' },
        })),
      ],
    },
  ];

  const completion = await groq.chat.completions.create({
    messages,
    model: 'meta-llama/llama-3.2-90b-vision-preview',
    response_format: { type: 'json_object' },
    temperature: 0.5,
    max_tokens: 4000,
  });

  const responseText = completion.choices[0]?.message?.content || '{}';
  const data = JSON.parse(responseText);

  return {
    query,
    content: data.content || 'No content generated.',
    sources: data.sources || [],
    mindMap: data.mindMap,
  };
};

const handleAiResearch = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { query, images } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    if (images && images.length > 0) {
      const result = await researchWithImages(query, images);
      return res.status(200).json(result);
    }
    const result = await researchTopic(query);
    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: 'Failed to perform research' });
  }
};

export default async function handler(req: any, res: any) {
  const segments = getSegments(req);
  const path = segments.join('/');

  if (path === 'me') return handleMe(req, res);
  if (path === 'notes') return handleNotes(req, res);
  if (segments[0] === 'notes' && segments.length === 2) return handleNoteById(req, res, segments[1]);
  if (path === 'history') return handleHistory(req, res);
  if (path === 'logs') return handleLogs(req, res);
  if (path === 'admin/users') return handleAdminUsers(req, res);
  if (segments[0] === 'admin' && segments[1] === 'users' && segments[3] === 'role' && segments.length === 4)
    return handleAdminUserRole(req, res, segments[2]);
  if (path === 'payments/jazzcash/initiate') return handleJazzCashInitiate(req, res);
  if (path === 'payments/jazzcash/callback') return handleJazzCashCallback(req, res);
  if (path === 'ai/daily-articles') return handleAiDailyArticles(req, res);
  if (path === 'ai/quiz') return handleAiQuiz(req, res);
  if (path === 'ai/research') return handleAiResearch(req, res);
  if (path === 'ai/study-material') return handleAiStudyMaterial(req, res);

  return res.status(404).json({ error: 'Not Found' });
}

