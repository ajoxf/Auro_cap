/* ============================================================================
   api/crypto-checkout.js  —  POST { kind, id, email, name }
   ----------------------------------------------------------------------------
   Starts a crypto payment for a PAID course/bundle:
     1. resolves the item's REAL price from Thinkific (never trust the client),
     2. creates a Cregis payment order (amount + metadata + callback),
     3. returns { checkoutUrl } for the browser to redirect to.
   On confirmed payment, api/crypto-webhook.js enrolls the student.

   Env vars (set in Vercel): THINKIFIC_API_KEY, THINKIFIC_SUBDOMAIN,
   CREGIS_API_KEY, CREGIS_API_SECRET, CREGIS_BASE (optional),
   PUBLIC_SITE_URL (for success/callback URLs), UPSTASH_REDIS_REST_URL/TOKEN (optional).
   ============================================================================ */
const TK_BASE = 'https://api.thinkific.com/api/public/v1';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const KEY = process.env.THINKIFIC_API_KEY, SUB = process.env.THINKIFIC_SUBDOMAIN;
  if (!KEY || !SUB) return res.status(500).json({ error: 'Thinkific env vars missing' });
  if (!process.env.CREGIS_API_KEY || !process.env.CREGIS_API_SECRET)
    return res.status(503).json({ error: 'Crypto payment is not configured yet.' });

  try {
    const body = await readJson(req);
    const kind = String(body.kind || '').toLowerCase();       // 'course' | 'bundle'
    const id = String(body.id || '');
    const email = String(body.email || '').trim();
    const name = String(body.name || '').trim();
    if (!['course', 'bundle'].includes(kind) || !id) return res.status(400).json({ error: 'Bad kind/id' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !name) return res.status(400).json({ error: 'Name and valid email required' });

    // --- Resolve the real price + price_id from Thinkific (server-side, anti-tamper) ---
    const priced = await resolvePrice(KEY, SUB, kind, id);
    if (!priced || !(priced.amount > 0))
      return res.status(400).json({ error: 'This item is not a paid product.' });

    // --- Create the Cregis order ---
    const orderId = makeOrderId(kind, id, email);
    const order = await createCregisOrder({
      orderId,
      amountUsd: priced.amount,
      description: priced.name,
      metadata: { kind, id, email, name, priceId: priced.priceId },
    });

    // --- Best-effort: persist a pending order (idempotency + status polling) ---
    await kvSet(`order:${orderId}`, { status: 'pending', kind, id, email, name, priceId: priced.priceId, amount: priced.amount });

    return res.status(200).json({ checkoutUrl: order.checkoutUrl, orderId });
  } catch (e) {
    return res.status(502).json({ error: String((e && e.message) || e) });
  }
};

/* ---- Thinkific price lookup ------------------------------------------------ */
async function resolvePrice(KEY, SUB, kind, id) {
  // Find the product whose productable is this course/bundle id, take its primary price.
  const products = await tkAll(KEY, SUB, 'products');
  const wantType = kind === 'bundle' ? 'bundle' : 'course';
  const p = products.find(x =>
    String(x.productable_type || '').toLowerCase() === wantType &&
    String(x.productable_id) === String(id));
  if (!p) return null;
  const prices = Array.isArray(p.product_prices) ? p.product_prices : [];
  const primary = prices.find(x => x.is_primary) || prices[0] || null;
  return {
    name: p.name,
    amount: Number(primary ? primary.price : p.price) || 0,
    priceId: primary ? primary.id : '',
  };
}

/* ---- Cregis order creation (ISOLATED — fill in from Cregis API docs) -------- */
async function createCregisOrder({ orderId, amountUsd, description, metadata }) {
  // TODO(Cregis): replace with the exact Cregis "create payment order" call.
  // Expected shape (adjust to their docs):
  //   POST {CREGIS_BASE}/api/v1/checkout/order
  //   headers: signed with CREGIS_API_KEY / CREGIS_API_SECRET (HMAC per their spec)
  //   body: { out_trade_no: orderId, amount: amountUsd, currency: 'USD',
  //           coins: 'USDT,USDC', callback_url: `${site}/api/crypto-webhook`,
  //           success_url: `${site}/crypto-success.html?order=${orderId}`,
  //           metadata }
  //   → returns a hosted checkout URL.
  const site = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const base = (process.env.CREGIS_BASE || 'https://api.cregis.com').replace(/\/$/, '');
  const payload = {
    out_trade_no: orderId,
    amount: amountUsd,
    currency: 'USD',
    callback_url: `${site}/api/crypto-webhook`,
    success_url: `${site}/crypto-success.html?order=${encodeURIComponent(orderId)}`,
    remark: description,
    metadata,
  };
  const r = await fetch(`${base}/api/v1/checkout/order`, {
    method: 'POST',
    headers: cregisAuthHeaders(payload),
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Cregis order → HTTP ${r.status} · ${text}`);
  const d = safeJson(text);
  const checkoutUrl = d && (d.checkout_url || d.payment_url || (d.data && d.data.checkout_url));
  if (!checkoutUrl) throw new Error('Cregis: no checkout_url in response');
  return { checkoutUrl };
}

// TODO(Cregis): implement their exact request signing (HMAC-SHA256 over a canonical
// string, or an api-key + nonce + sign header). Placeholder passes the key through.
function cregisAuthHeaders(_payload) {
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': process.env.CREGIS_API_KEY,
  };
}

/* ---- Thinkific fetch helpers (auth-scheme tolerant) ------------------------ */
async function tkAll(KEY, SUB, resource) {
  let page = 1, out = [];
  for (;;) {
    const r = await tkFetch(KEY, SUB, `${TK_BASE}/${resource}?page=${page}&limit=250`);
    if (!r.ok) throw new Error(`Thinkific ${resource} → HTTP ${r.status}`);
    const d = await r.json();
    const items = d.items || d[resource] || [];
    out = out.concat(items);
    if (!d.meta || !d.meta.pagination || page >= d.meta.pagination.total_pages) break;
    page++;
  }
  return out;
}
async function tkFetch(KEY, SUB, url) {
  const r = await fetch(url, { headers: { 'X-Auth-API-Key': KEY, 'X-Auth-Subdomain': SUB, 'Content-Type': 'application/json' } });
  if (r.status !== 401) return r;
  const bearer = await fetch(url, { headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' } });
  return bearer.status === 401 ? r : bearer;
}

/* ---- Upstash Redis (optional; no-ops if not configured) -------------------- */
async function kvSet(key, val) {
  const url = process.env.UPSTASH_REDIS_REST_URL, tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok) return;
  try {
    await fetch(`${url}/set/${encodeURIComponent(key)}`, {
      method: 'POST', headers: { Authorization: `Bearer ${tok}` }, body: JSON.stringify(val),
    });
  } catch (_) { /* best effort */ }
}

/* ---- misc ----------------------------------------------------------------- */
function makeOrderId(kind, id, email) {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `mer_${kind}_${id}_${stamp}${rand}`;
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    if (req.body) { try { return resolve(typeof req.body === 'string' ? JSON.parse(req.body) : req.body); } catch (e) { return reject(e); } }
    let raw = '';
    req.on('data', c => (raw += c));
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
function safeJson(t) { try { return JSON.parse(t); } catch (_) { return null; } }
