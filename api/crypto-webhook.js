/* ============================================================================
   api/crypto-webhook.js  —  Cregis payment callback → Thinkific fulfilment
   ----------------------------------------------------------------------------
   On a confirmed/paid Cregis callback we (idempotently):
     • verify the callback signature (same md5 scheme as create-order),
     • recover the order metadata (Upstash if configured, else the base64 passthrough),
     • fulfil per kind:
         'course'   → find-or-create user, POST /enrollments { course_id, user_id }
         'bundle'   → enroll the user into every member course of the bundle
         'coaching' → live_event: NO course enrollment; record the booking + email the
                      buyer next steps (scheduling happens outside Thinkific).
     • mark the order processed so repeat callbacks are no-ops.

   Env: THINKIFIC_API_KEY, THINKIFIC_SUBDOMAIN, CREGIS_API_SECRET,
        UPSTASH_REDIS_REST_URL/TOKEN (optional), RESEND_API_KEY + RECEIPT_FROM (optional email).
   ============================================================================ */
const TK_BASE = 'https://api.thinkific.com/api/public/v1';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const KEY = process.env.THINKIFIC_API_KEY, SUB = process.env.THINKIFIC_SUBDOMAIN;
  if (!KEY || !SUB) return res.status(500).json({ error: 'Thinkific env vars missing' });

  try {
    const raw = await readRaw(req);
    const body = safeJson(raw) || {};

    // 1) Verify the callback really came from Cregis (reject spoofed enrollments).
    if (!verifyCregisCallback(body)) return res.status(401).json({ error: 'Bad signature' });

    // 2) Normalise the event.
    const status = String(body.status || body.order_status || body.trade_status
                        || (body.data && (body.data.status || body.data.order_status)) || '').toLowerCase();
    const orderId = String(body.order_id || body.out_trade_no
                        || (body.data && (body.data.order_id || body.data.out_trade_no)) || '');
    const paid = ['paid', 'success', 'completed', 'confirmed', 'finished', 'settled', 'paid_over'].includes(status);
    if (!orderId) return res.status(400).json({ error: 'No order id' });
    if (!paid) return res.status(200).json({ ok: true, ignored: status }); // not-yet-paid callbacks

    // 3) Enroll-once guard.
    if (await kvGet(`processed:${orderId}`)) return res.status(200).json({ ok: true, duplicate: true });

    // 4) Recover metadata: prefer the store, else the base64 passthrough echoed by Cregis.
    const attach = body.attach || (body.data && body.data.attach) || '';
    const meta = (await kvGet(`order:${orderId}`)) || decodeMeta(attach) || {};
    const email = String(meta.email || '').trim();
    const name = String(meta.name || '').trim();
    const kind = String(meta.kind || 'course').toLowerCase();
    if (!email) return res.status(400).json({ error: 'Missing email in order metadata' });

    // 5) Fulfil.
    if (kind === 'coaching') {
      // live_event — NOT a course enrollment. Record the paid booking + next steps.
      await sendEmail(email, name, 'Your 1:1 coaching session is booked',
        `Hi ${name || 'there'},\n\nThank you — your payment is confirmed and your 1:1 coaching session is booked. ` +
        `We'll be in touch shortly to arrange a time that suits you.\n\n— Meridian Finance Academy`);
    } else {
      const user = await findOrCreateUser(KEY, SUB, email, name);
      const courseIds = kind === 'bundle'
        ? await bundleCourseIds(KEY, SUB, meta.productableId)
        : [meta.productableId];
      for (const cid of courseIds) if (cid) await enroll(KEY, SUB, cid, user.id);
    }

    await kvSet(`processed:${orderId}`, { at: Date.now(), kind });
    await sendReceipt({ email, name, orderId, kind, amount: meta.amount });
    return res.status(200).json({ ok: true, kind });
  } catch (e) {
    // 500 → Cregis retries; our enroll-once guard + Thinkific's 422-on-dupe make retries safe.
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
};

/* ---- Cregis callback signature (same md5 scheme as create-order) ----------- */
function verifyCregisCallback(body) {
  const secret = process.env.CREGIS_API_SECRET;
  const sign = body.sign || (body.data && body.data.sign);
  if (!secret || !sign) return false;
  const expected = cregisSign(body, secret);
  return timingSafeEqual(String(sign).toLowerCase(), expected);
}
function cregisSign(params, secret) {
  const crypto = require('crypto');
  const keys = Object.keys(params)
    .filter(k => k !== 'sign' && params[k] !== '' && params[k] != null)
    .sort();
  let s = String(secret || '');
  for (const k of keys) {
    const v = params[k];
    s += k + (typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  return crypto.createHash('md5').update(s, 'utf8').digest('hex').toLowerCase();
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/* ---- Thinkific enrollment -------------------------------------------------- */
async function findOrCreateUser(KEY, SUB, email, name) {
  const found = await tkFetch(KEY, SUB, `${TK_BASE}/users?query[email]=${encodeURIComponent(email)}`);
  if (found.ok) {
    const d = await found.json();
    const items = d.items || [];
    if (items[0]) return items[0];
  }
  const [first, ...rest] = (name || email.split('@')[0]).split(' ');
  const r = await tkFetch(KEY, SUB, `${TK_BASE}/users`, {
    method: 'POST',
    body: JSON.stringify({
      first_name: first || 'Student',
      last_name: rest.join(' ') || '-',
      email,
      send_welcome_email: true,   // Thinkific emails them a set-password / welcome link
    }),
  });
  if (!r.ok) throw new Error(`Thinkific create user → HTTP ${r.status} · ${await r.text()}`);
  return r.json();
}
async function enroll(KEY, SUB, courseId, userId) {
  const r = await tkFetch(KEY, SUB, `${TK_BASE}/enrollments`, {
    method: 'POST',
    body: JSON.stringify({ course_id: Number(courseId), user_id: Number(userId), activated_at: new Date().toISOString() }),
  });
  // 422 usually = already enrolled → treat as success (idempotent).
  if (!r.ok && r.status !== 422) throw new Error(`Thinkific enroll → HTTP ${r.status} · ${await r.text()}`);
}
async function bundleCourseIds(KEY, SUB, bundleId) {
  if (!bundleId) return [];
  const r = await tkFetch(KEY, SUB, `${TK_BASE}/bundles/${encodeURIComponent(bundleId)}/courses?limit=250`);
  if (!r.ok) throw new Error(`Thinkific bundle courses → HTTP ${r.status}`);
  const d = await r.json();
  return (d.items || []).map(c => c.id);
}

/* ---- Email (Resend, optional) + receipt ----------------------------------- */
async function sendEmail(to, name, subject, text) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // ESP not configured → skip (best effort; never blocks fulfilment)
  const from = process.env.RECEIPT_FROM || 'Meridian Finance Academy <no-reply@meridianfinance.academy>';
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text }),
    });
  } catch (_) { /* best effort */ }
}
async function sendReceipt({ email, name, orderId, kind, amount }) {
  // Never throw — a receipt failure must NOT undo a completed enrollment.
  try {
    await sendEmail(email, name, 'Your Meridian receipt',
      `Hi ${name || 'there'},\n\nThanks for your purchase (${kind}). Order ${orderId}` +
      `${amount ? ` — $${amount}` : ''}.\n\n— Meridian Finance Academy`);
  } catch (_) { /* swallow */ }
}

/* ---- helpers -------------------------------------------------------------- */
async function tkFetch(KEY, SUB, url, opts = {}) {
  const headers = { 'X-Auth-API-Key': KEY, 'X-Auth-Subdomain': SUB, 'Content-Type': 'application/json' };
  const r = await fetch(url, { ...opts, headers });
  if (r.status !== 401) return r;
  const bearer = await fetch(url, { ...opts, headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' } });
  return bearer.status === 401 ? r : bearer;
}
async function kvGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL, tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok) return null;
  try {
    const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${tok}` } });
    const d = await r.json();
    return d && d.result ? (safeJson(d.result) || d.result) : null;
  } catch (_) { return null; }
}
async function kvSet(key, val) {
  const url = process.env.UPSTASH_REDIS_REST_URL, tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok) return;
  try {
    await fetch(`${url}/set/${encodeURIComponent(key)}`, { method: 'POST', headers: { Authorization: `Bearer ${tok}` }, body: JSON.stringify(val) });
  } catch (_) { /* best effort */ }
}
function decodeMeta(s) {
  if (!s) return null;
  try {
    const b64 = String(s).replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } catch (_) { return null; }
}
function readRaw(req) {
  return new Promise((resolve, reject) => {
    if (typeof req.body === 'string') return resolve(req.body);
    if (req.body) return resolve(JSON.stringify(req.body));
    let raw = '';
    req.on('data', c => (raw += c));
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}
function safeJson(t) { try { return JSON.parse(t); } catch (_) { return null; } }
