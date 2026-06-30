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
  const [courses, instructors, bundles] = await Promise.all([
    tkAll(KEY, SUB, 'courses'),
    tkAll(KEY, SUB, 'instructors'),
    tkAll(KEY, SUB, 'bundles'),
  ]);

  const instrName = {};
  instructors.forEach(t => { instrName[t.id] = fullName(t); });

  const outCourses = courses
    .filter(c => c.published !== false)
    .map((c, i) => mapCourse(c, i, instrName));

  // Each bundle = one learning path; pull its member courses (best-effort).
  const outPaths = await Promise.all(bundles
    .filter(b => b.published !== false)
    .map(async (b, i) => {
      let members = [];
      try { members = await tkAll(KEY, SUB, `bundles/${b.id}/courses`); } catch (_) {}
      return mapBundle(b, i, members);
    }));

  const outInstr = instructors.map((t, i) => mapInstructor(t, i));

  return { courses: outCourses, instructors: outInstr, bundles: outPaths, logos: CONFIG.logos };
}

/* ---- Thinkific fetch with pagination ---- */
async function tkAll(KEY, SUB, resource) {
  const out = [];
  let page = 1;
  for (;;) {
    const sep = resource.includes('?') ? '&' : '?';
    const r = await fetch(`${API}/${resource}${sep}page=${page}&limit=100`, {
      headers: {
        'X-Auth-API-Key': KEY,
        'X-Auth-Subdomain': SUB,
        'Content-Type': 'application/json',
      },
    });
    if (!r.ok) throw new Error(`Thinkific ${resource} → HTTP ${r.status}`);
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
function mapCourse(c, i, instrName) {
  const kw = String(c.keywords || '');
  const fm = /featured(?:-(\d+))?/i.exec(kw);
  return {
    id: c.id,
    thinkificCourseId: c.id,                 // enables direct /enroll/{id} checkout links
    title: c.name,
    slug: c.slug,
    thinkificSlug: c.slug,
    cat: token(kw, 'cat') || 'Courses',
    instr: instrName[c.user_id] || instrName[c.instructor_id] || '',
    price: priceOf(c),
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

function mapBundle(b, i, members) {
  return {
    name: b.name,
    slug: b.slug || slugify(b.name),
    thinkificSlug: b.slug || '',
    desc: b.description || '',
    blurb: b.description || '',
    price: priceOf(b),
    n: members.length || Number(b.courses_count || 0) || 0,
    tile: CONFIG.accents[i % CONFIG.accents.length],
    // member-course slugs → the bundle page resolves these against the course list.
    courses: members.map(m => m.slug || String(m.id)),
  };
}

function mapInstructor(t, i) {
  const name = fullName(t);
  return {
    name,
    slug: slugify(name),
    role: t.title || '',
    cred: t.title || '',
    bio: t.bio || '',
    students: '—',
    courses: 0,
    photo: t.avatar_url || '',
  };
}

/* ---- small helpers ---- */
function fullName(t) {
  return (t.name || `${t.first_name || ''} ${t.last_name || ''}`).trim() || 'Instructor';
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
