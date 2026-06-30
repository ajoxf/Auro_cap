/* ============================================================================
   api/catalog.js  —  Vercel Serverless Function
   ----------------------------------------------------------------------------
   The bridge that makes the whole site Thinkific-driven.

   Why it exists:
     • The Thinkific Admin API needs a secret API key, which must NEVER live in
       front-end code, and the API does not allow direct browser calls (CORS).
     • So this function sits in the middle: it calls Thinkific with the secret key
       (a Vercel env var), reshapes the data into the format meridian.js expects,
       caches it on Vercel's CDN, and serves it to the site with CORS enabled.

   Result: the non-technical team manages EVERYTHING inside the Thinkific admin
   (courses, prices, instructors, bundles, what's featured) and the marketing
   site reflects it automatically — no code changes, ever.

   ── Deploy on Vercel (≈10 min) ────────────────────────────────────────────
   1. Put this repo on Vercel: vercel.com → Add New → Project → import the repo
      (or run `npx vercel` from the repo root). The `api/` folder is detected
      automatically — this becomes the endpoint  /api/catalog.
   2. Project → Settings → Environment Variables → add (Production + Preview):
        THINKIFIC_API_KEY    = (Thinkific → Settings → Code & Analytics → API)
        THINKIFIC_SUBDOMAIN  = your-school   (the part before .thinkific.com)
   3. Deploy. Your endpoint is  https://<project>.vercel.app/api/catalog
   4. In meridian.js set:  catalogEndpoint: 'https://<project>.vercel.app/api/catalog'
   Done. See THINKIFIC_INTEGRATION.md for the full portal playbook.

   ── How the team controls marketing fields (all inside Thinkific) ──────────
   Core fields come straight from Thinkific: course name, price, description
   (the course SUBTITLE), instructor, image, and bundles (= learning paths).
   The few "marketing polish" fields are set with simple tokens typed into the
   course's KEYWORDS box (Course → Settings → SEO → Keywords). All optional:

        featured-1            → show on the home page, position 1 (2,3… for order)
        cat:Technical         → catalog category / filter chip
        level:Intermediate    → level badge
        hours:8.5             → "8.5 hrs"
        tag:Bestseller        → corner ribbon

   Example Keywords value:  featured-2, cat:Quant, level:Advanced, hours:11, tag:Bestseller
   ============================================================================ */

const CONFIG = {
  // Lock this to your site origin in production, e.g. 'https://ajoxf.github.io'.
  allowOrigin: '*',
  // CDN-cache the assembled catalog this long (seconds). Team edits in Thinkific
  // appear on the site within this window. 600 = 10 min (≤ ~144 Thinkific hits/day).
  cacheSeconds: 600,
  // Institutions marquee (instructor firms aren't structured data in Thinkific).
  logos: ['Bloomberg','Goldman Sachs','BlackRock','Morgan Stanley','J.P. Morgan',
          'Fidelity','Two Sigma','Citadel','Barclays','UBS'],
  // Card accent palette (assigned automatically, so the team needn't pick colors).
  accents: ['#8a6d1f','#b8923c','#b08d3c','#cdab57','#9a7b2e'],
};

const API = 'https://api.thinkific.com/api/public/v1';

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', CONFIG.allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const KEY = process.env.THINKIFIC_API_KEY, SUB = process.env.THINKIFIC_SUBDOMAIN;
  if (!KEY || !SUB) {
    return res.status(500).json({ error: 'Missing THINKIFIC_API_KEY / THINKIFIC_SUBDOMAIN env vars' });
  }
  try {
    const data = await buildCatalog(KEY, SUB);
    // Vercel's CDN serves this cached copy for cacheSeconds, then revalidates in the
    // background — so Thinkific is hit ~once per window no matter the traffic.
    res.setHeader('Cache-Control',
      `public, s-maxage=${CONFIG.cacheSeconds}, stale-while-revalidate=${CONFIG.cacheSeconds * 2}`);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: String((e && e.message) || e) });
  }
}

/* ---- assemble the normalized catalog the site expects ---- */
async function buildCatalog(KEY, SUB) {
  const [courses, instructors] = await Promise.all([
    tkAll(KEY, SUB, 'courses'),
    tkAll(KEY, SUB, 'instructors'),
  ]);

  // /products carries the PRICE (the /courses payload has none) and tells us which
  // items are bundles. There is no /bundles list endpoint — bundles are products.
  let products = [];
  try { products = await tkAll(KEY, SUB, 'products'); } catch (_) { /* products optional */ }

  const priceByCourse = {};   // course id → price
  const bundleProducts = [];  // products that represent a learning-path bundle
  for (const p of products) {
    const type = String(p.productable_type || '').toLowerCase();
    if (type === 'course') priceByCourse[p.productable_id] = p.price;
    else if (type === 'bundle' && p.status !== 'draft' && !p.hidden && !p.private) bundleProducts.push(p);
  }

  const instrName = {};
  instructors.forEach(t => { instrName[t.id] = fullName(t); });

  const outCourses = courses
    .filter(c => c.published !== false)
    .map((c, i) => mapCourse(c, i, instrName, priceByCourse));

  // Each bundle product = one learning path; pull its member courses (best-effort).
  const outPaths = await Promise.all(bundleProducts.map(async (p, i) => {
    let members = [];
    try { members = await tkAll(KEY, SUB, `bundles/${p.productable_id}/courses`); } catch (_) {}
    return mapBundle(p, i, members);
  }));

  const outInstr = instructors.map((t, i) => mapInstructor(t, i, SUB));

  return { courses: outCourses, instructors: outInstr, bundles: outPaths, logos: CONFIG.logos };
}

/* ---- one request, tolerant of both Thinkific auth schemes ---- */
async function tkFetch(KEY, SUB, url) {
  // Legacy single-site API key: X-Auth-API-Key + X-Auth-Subdomain.
  const r = await fetch(url, {
    headers: { 'X-Auth-API-Key': KEY, 'X-Auth-Subdomain': SUB, 'Content-Type': 'application/json' },
  });
  if (r.status !== 401) return r;
  // Newer OAuth-style access tokens: Authorization: Bearer. Retry once.
  const bearer = await fetch(url, {
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  });
  return bearer.status === 401 ? r : bearer;   // keep the first response if Bearer also 401s
}

/* ---- Thinkific fetch with pagination ---- */
async function tkAll(KEY, SUB, resource) {
  const out = [];
  let page = 1;
  for (;;) {
    const sep = resource.includes('?') ? '&' : '?';
    const r = await tkFetch(KEY, SUB, `${API}/${resource}${sep}page=${page}&limit=100`);
    if (!r.ok) {
      let body = '';
      try { body = (await r.text()).replace(/\s+/g, ' ').slice(0, 240); } catch (_) {}
      throw new Error(`Thinkific ${resource} → HTTP ${r.status}${body ? ' · ' + body : ''}`);
    }
    const j = await r.json();
    const items = Array.isArray(j) ? j : (j.items || []);
    out.push(...items);
    const next = j && j.meta && j.meta.pagination && j.meta.pagination.next_page;
    if (!next || page >= 50) break;     // 50-page safety cap
    page = next;
  }
  return out;
}

/* ---- field mappers (raw Thinkific → site shape) ---- */
function mapCourse(c, i, instrName, priceByCourse) {
  const kw = String(c.keywords || '');
  const fm = /featured(?:-(\d+))?/i.exec(kw);
  const rawPrice = (priceByCourse && priceByCourse[c.id] != null) ? priceByCourse[c.id] : c.price;
  return {
    id: c.id,
    thinkificCourseId: c.id,                 // enables direct /enroll/{id} checkout links
    title: c.name,
    slug: c.slug,
    thinkificSlug: c.slug,
    cat: token(kw, 'cat') || 'Courses',
    instr: instrName[c.user_id] || instrName[c.instructor_id] || '',
    price: priceOf({ price: rawPrice }),
    hours: token(kw, 'hours') || '',
    lessons: Number(c.chapters_count || c.lessons_count || 0) || 0,
    level: token(kw, 'level') || 'All levels',
    rating: c.reviews_average ? Number(c.reviews_average).toFixed(1) : '',
    tag: token(kw, 'tag') || '',
    accent: CONFIG.accents[i % CONFIG.accents.length],
    description: c.subtitle || c.description || '',
    image: c.course_card_image_url || c.banner_image_url || '',
    keywords: kw,
    featured: /featured/i.test(kw),
    order: fm && fm[1] ? Number(fm[1]) : 0,
  };
}

// `p` is a Thinkific PRODUCT of type Bundle (name/slug/price), `members` its courses.
function mapBundle(p, i, members) {
  return {
    name: p.name,
    slug: p.slug || slugify(p.name),
    thinkificSlug: p.slug || '',
    desc: p.description || '',
    blurb: p.description || '',
    price: priceOf(p),
    n: members.length,
    tile: CONFIG.accents[i % CONFIG.accents.length],
    // member-course slugs → the bundle page resolves these against the course list.
    courses: members.map(m => m.slug || String(m.id)),
  };
}

function mapInstructor(t, i, SUB) {
  const name = fullName(t);
  let photo = t.avatar_url || '';
  // Thinkific returns relative paths for default/uploaded avatars — make them absolute
  // so they load off our domain. Drop the generic default so the initials avatar shows.
  if (/instructor-avatar\.png|\/defaults\//.test(photo)) photo = '';
  else if (photo.startsWith('/')) photo = `https://${SUB}.thinkific.com${photo}`;
  return {
    name,
    slug: slugify(name),
    role: t.title || '',
    cred: t.title || '',
    bio: t.bio || '',
    students: '—',
    courses: 0,
    photo,
  };
}

/* ---- small helpers ---- */
function fullName(t) {
  return (t.name || `${t.first_name || ''} ${t.last_name || ''}`).replace(/\s+/g, ' ').trim() || 'Instructor';
}
// Pull a "key:value" token out of the keywords string (cat:Quant, level:Advanced…).
function token(kw, key) {
  const m = new RegExp(key + '\\s*:\\s*([^,]+)', 'i').exec(kw);
  return m ? m[1].trim() : '';
}
// Thinkific prices can arrive as a number or string; treat 0/blank as free.
function priceOf(o) {
  const p = o.price != null ? o.price : (o.product && o.product.price);
  const n = Number(String(p).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
function slugify(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
