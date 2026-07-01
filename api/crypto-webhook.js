/* ============================================================================
   api/crypto-webhook.js  —  Cregis → us, on payment status change
   ----------------------------------------------------------------------------
   When Cregis confirms payment, we (idempotently):
     1. find-or-create the Thinkific student by email,
     2. enroll them in the course (or every course in the bundle),
     3. send a welcome/set-password email + a receipt (auto-PDF — see sendReceipt).

   Env vars: THINKIFIC_API_KEY, THINKIFIC_SUBDOMAIN, CREGIS_API_SECRET,
   UPSTASH_REDIS_REST_URL/TOKEN (for enroll-once), plus email/PDF provider creds.
   ============================================================================ */
const TK_BASE = 'https://api.thinkific.com/api/public/v1';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const KEY = process.env.THINKIFIC_API_KEY, SUB = process.env.THINKIFIC_SUBDOMAIN;
  if (!KEY || !SUB) return res.status(500).json({ error: 'Thinkific env vars missing' });

  try {
    const raw = await readRaw(req);
    const body = safeJson(raw) || {};

    // --- Verify the callback is really from Cregis (reject spoofed enrollments) ---
    if (!verifyCregisSignature(req, raw)) return res.status(401).json({ error: 'Bad signature' });

    // --- Normalize the event (adjust field names to Cregis's payload) ---
    const status = String(body.status || body.trade_status || (body.data && body.data.status) || '').toLowerCase();
    const orderId = String(body.out_trade_no || (body.data && body.data.out_trade_no) || '');
    const meta = body.metadata || (body.data && body.data.metadata) || {};
    const paid = ['paid', 'success', 'completed', 'confirmed', 'finished'].includes(status);
    if (!orderId) return res.status(400).json({ error: 'No order id' });
    if (!paid) return res.status(200).json({ ok: true, ignored: status }); // not-yet-paid callbacks

    // --- Enroll-once guard ---
    if (await kvGet(`processed:${orderId}`)) return res.status(200).json({ ok: true, duplicate: true });

    const email = String(meta.email || '').trim();
    const name = String(meta.name || '').trim();
    const kind = String(meta.kind || 'course').toLowerCase();
    const id = String(meta.id || '');
    if (!email || !id) return res.status(400).json({ error: 'Missing email/id in metadata' });

    // --- Find or create the student ---
    const user = await findOrCreateUser(KEY, SUB, email, name);

    // --- Enroll: one course, or every course in the bundle ---
    const courseIds = kind === 'bundle'
      ? await bundleCourseIds(KEY, SUB, id)
      : [id];
    for (const cid of courseIds) await enroll(KEY, SUB, cid, user.id);

    await kvSet(`processed:${orderId}`, { at: Date.now(), userId: user.id, courseIds });
    await sendReceipt({ email, name, orderId, courseIds }); // auto-PDF receipt (see TODO)

    return res.status(200).json({ ok: true, enrolled: courseIds.length });
  } catch (e) {
    // 500 → Cregis will retry; our enroll-once guard makes retries safe.
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
};

/* ---- Cregis signature verification (ISOLATED — fill from Cregis docs) ------ */
function verifyCregisSignature(req, rawBody) {
  // TODO(Cregis): implement their exact scheme, e.g. HMAC-SHA256(rawBody, CREGIS_API_SECRET)
  // compared to a header like `X-Cregis-Signature`. Return true only on match.
  // Until implemented, refuse to process (fail closed) so no one can spoof enrollments.
  const sig = req.headers['x-cregis-signature'] || req.headers['x-signature'];
  const secret = process.env.CREGIS_API_SECRET;
  if (!secret || !sig) return false;
  try {
    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return timingSafeEqual(expected, String(sig));
  } catch (_) { return false; }
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
      // No password → student sets one via Thinkific's welcome / password-set email.
      send_welcome_email: true,
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
  const r = await tkFetch(KEY, SUB, `${TK_BASE}/bundles/${encodeURIComponent(bundleId)}/courses?limit=250`);
  if (!r.ok) throw new Error(`Thinkific bundle courses → HTTP ${r.status}`);
  const d = await r.json();
  return (d.items || []).map(c => c.id);
}

/* ---- Receipt (auto-PDF) — ISOLATED, fill in with your email/PDF provider --- */
async function sendReceipt({ email, name, orderId, courseIds }) {
  // TODO: generate a PDF receipt (e.g. pdfkit / an HTML→PDF service) and email it via
  // an ESP (Resend/SendGrid/Postmark). Needs a provider API key in env. Best-effort:
  // never throw here — a receipt failure must NOT undo a completed enrollment.
  try {
    // placeholder no-op until the email/PDF provider is chosen & keyed.
    return;
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
    return d && d.result ? safeJson(d.result) || d.result : null;
  } catch (_) { return null; }
}
async function kvSet(key, val) {
  const url = process.env.UPSTASH_REDIS_REST_URL, tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok) return;
  try {
    await fetch(`${url}/set/${encodeURIComponent(key)}`, { method: 'POST', headers: { Authorization: `Bearer ${tok}` }, body: JSON.stringify(val) });
  } catch (_) { /* best effort */ }
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
