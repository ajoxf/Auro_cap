/* ============================================================================
   api/crypto-checkout.js  —  POST { kind, id, email, name }
   ----------------------------------------------------------------------------
   Starts a crypto payment for a PAID course / bundle / 1:1 coaching:
     1. resolves the item's REAL price from Thinkific (never trust the client),
     2. creates a Cregis payment order (amount + metadata + callback),
     3. returns { checkoutUrl } for the browser to redirect to.
   On confirmed payment, api/crypto-webhook.js fulfils the order.

   NOTE: the site now sends the Thinkific PRODUCT id (thinkificCourseId /
   thinkificBundleId / COACHING.productId), so we match products by product id.

   Env vars (Vercel): THINKIFIC_API_KEY, THINKIFIC_SUBDOMAIN, CREGIS_API_KEY,
   CREGIS_API_SECRET, CREGIS_PID (optional; defaults to CREGIS_API_KEY), CREGIS_BASE
   (optional), PUBLIC_SITE_URL, UPSTASH_REDIS_REST_URL/TOKEN (optional).
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
    const kind = String(body.kind || '').toLowerCase();       // 'course' | 'bundle' | 'coaching'
    const id = String(body.id || '');                          // Thinkific PRODUCT id
    const email = String(body.email || '').trim();
    const name = String(body.name || '').trim();
    if (!['course', 'bundle', 'coaching'].includes(kind) || !id) return res.status(400).json({ error: 'Bad kind/id' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !name) return res.status(400).json({ error: 'Name and valid email required' });

    // --- Resolve the real price + ids from Thinkific (server-side, anti-tamper) ---
    const priced = await resolvePrice(KEY, SUB, kind, id);
    if (!priced || !(priced.amount > 0))
      return res.status(400).json({ error: 'This item is not a paid product.' });

    // Everything the webhook needs to fulfil the order (also base64-passed to Cregis so
    // fulfilment works even without the Upstash store).
    const metadata = {
      kind,
      productId: priced.productId,          // Thinkific product id
      productableId: priced.productableId,  // course/bundle id used for enrollment
      priceId: priced.priceId,
      amount: priced.amount,
      email, name,
    };

    // --- Create the Cregis order ---
    const orderId = makeOrderId(kind, id);
    const order = await createCregisOrder({ orderId, amountUsd: priced.amount, description: priced.name, metadata });

    // --- Best-effort: persist a pending order (idempotency + status polling) ---
    await kvSet(`order:${orderId}`, { status: 'pending', ...metadata });

    return res.status(200).json({ checkoutUrl: order.checkoutUrl, orderId });
  } catch (e) {
    return res.status(502).json({ error: String((e && e.message) || e) });
  }
};

/* ---- Thinkific price lookup (match by PRODUCT id first) -------------------- */
async function resolvePrice(KEY, SUB, kind, id) {
  const products = await tkAll(KEY, SUB, 'products');
  // kind → productable_type used only for the safety fallback match.
  const wantType = kind === 'bundle' ? 'bundle' : (kind === 'coaching' ? 'live_event' : 'course');
  const p = products.find(x => String(x.id) === String(id))
        || products.find(x => String(x.productable_type || '').toLowerCase() === wantType
                           && String(x.productable_id) === String(id));
  if (!p) return null;
  const prices = Array.isArray(p.product_prices) ? p.product_prices : [];
  const primary = prices.find(x => x.is_primary) || prices[0] || null;
  return {
    name: p.name,
    amount: Number(primary ? primary.price : p.price) || 0,
    priceId: primary ? primary.id : '',
    productId: p.id,
    productableId: p.productable_id,
    kind,
  };
}

/* ---- Cregis order creation -------------------------------------------------
   Signature (Cregis standard): take every non-empty request param, sort keys
   ascending, concatenate `key+value` with NO separators, PREPEND the API secret,
   MD5, lowercase → `sign`. pid / nonce / timestamp / sign travel in the JSON body.
   The endpoint PATH and a couple of business field names are isolated in CREGIS
   below, so if Cregis's spec differs it's a one-line change here (not a rewrite).
   ---------------------------------------------------------------------------- */
const CREGIS = {
  createOrderPath: '/api/v1/checkout/order',   // create-payment-order endpoint
  coins: 'USDT,USDC',                          // accepted settlement coins
  // create-order body field names (adjust here only if Cregis differs):
  fields: { orderId: 'order_id', amount: 'order_amount', currency: 'order_currency', coins: 'pay_currency' },
  // response fields that may carry the hosted checkout URL (first match wins):
  urlFields: ['checkout_url', 'payment_url', 'pay_url', 'cashier_url'],
};

async function createCregisOrder({ orderId, amountUsd, description, metadata }) {
  const site = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const base = (process.env.CREGIS_BASE || 'https://api.cregis.com').replace(/\/$/, '');
  const pid  = process.env.CREGIS_PID || process.env.CREGIS_API_KEY;
  const F = CREGIS.fields;

  const payload = {
    pid,
    [F.orderId]: orderId,
    [F.amount]: String(amountUsd),
    [F.currency]: 'USD',
    [F.coins]: CREGIS.coins,
    callback_url: `${site}/api/crypto-webhook`,
    success_url: `${site}/crypto-success.html?order=${encodeURIComponent(orderId)}`,
    remark: String(description || '').slice(0, 120),
    attach: encodeMeta(metadata),          // echoed back on the callback (no-store fallback)
    nonce: cregisNonce(),
    timestamp: String(Date.now()),
  };
  payload.sign = cregisSign(payload, process.env.CREGIS_API_SECRET);

  const r = await fetch(`${base}${CREGIS.createOrderPath}`, {
    method: 'POST', headers: cregisAuthHeaders(), body: JSON.stringify(payload),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Cregis order → HTTP ${r.status} · ${text}`);
  const d = safeJson(text) || {};
  const data = d.data || d;
  let checkoutUrl = '';
  for (const f of CREGIS.urlFields) { if (data && data[f]) { checkoutUrl = data[f]; break; } if (d[f]) { checkoutUrl = d[f]; break; } }
  if (!checkoutUrl) throw new Error(`Cregis: no checkout URL in response · ${text}`);
  return { checkoutUrl };
}

function cregisAuthHeaders() { return { 'Content-Type': 'application/json' }; }

/* Cregis signature: md5( secret + concat(key+value) over sorted non-empty params, excl. sign ). */
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
function cregisNonce() { return Math.random().toString(36).slice(2, 12); }

/* Compact URL-safe passthrough so the webhook can recover order metadata without a store. */
function encodeMeta(obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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
function makeOrderId(kind, id) {
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
