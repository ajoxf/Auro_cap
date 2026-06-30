/* ============================================================================
   meridian.js — SHARED THINKIFIC CONFIG + DATA LAYER
   ----------------------------------------------------------------------------
   This is the ONLY file a developer edits to connect the site to Thinkific.
   It is loaded by index.html AND course.html, so configuration lives in ONE
   place. After it's set up, the NON-TECHNICAL TEAM never touches any code —
   they add/edit courses, instructors and bundles inside the Thinkific admin
   portal and those changes flow onto the site automatically (see fetchCatalog
   + THINKIFIC.catalogEndpoint). See THINKIFIC_INTEGRATION.md.
   ============================================================================ */

const THINKIFIC = {
  // Your Thinkific domain — e.g. 'meridian.thinkific.com' or a custom domain.
  domain: 'YOUR-SCHOOL.thinkific.com',
  // Public URL where THIS site is hosted (used for canonical + share tags).
  // Leave '' to auto-detect from the browser. Set it once you have a final
  // domain, e.g. 'https://academy.meridian.com'.
  siteUrl: '',
  // Sign-in path on Thinkific (default works for all schools):
  signInPath: '/users/sign_in',
  // Enroll target. true = go straight to Thinkific CHECKOUT (/enroll/{id}) so
  // their marketing landing page is never surfaced. Needs each course's `id`
  // from the live feed; falls back to the course URL if an id isn't present.
  useDirectEnroll: true,
  // ---- LIVE SYNC (turn the whole site dynamic) ---------------------------
  // Point this at your proxy URL and the catalog, instructors, learning-path
  // bundles and logos all render from Thinkific at runtime — add a course in
  // Thinkific, it appears here on refresh, zero code edits. The proxy holds
  // your API key server-side. Leave '' to use the built-in demo data below.
  catalogEndpoint: '',
};

/* ----------------------------------------------------------------------------
   DEMO / FALLBACK CONTENT
   Shown only until catalogEndpoint is live (or if a fetch fails), so the site
   always looks complete. Once live sync is on, Thinkific data replaces all of
   this. Editing it by hand is optional and only affects the pre-launch demo.
   ---------------------------------------------------------------------------- */
const MERIDIAN_DATA = {
  // Learning paths === Thinkific BUNDLES (several courses sold together).
  paths: [
    { name:'Technical Trading Track',  n:26, price:899,  tile:'#8a6d1f', slug:'technical-trading-track',
      desc:'Price action, indicators, chart patterns, market structure.',
      blurb:'Go from chart-blind to reading any market with confidence. A complete, ordered path through price action, indicators, patterns and market structure — built so each course compounds on the last.',
      courses:['trend-analysis','chart-pattern-analysis','technical-indicators'] },
    { name:'Systematic Trading Track', n:21, price:949,  tile:'#b8923c', slug:'systematic-trading-track',
      desc:'Rules-based systems, backtesting, execution, risk.',
      blurb:'Turn discretion into rules. Design, backtest and run systematic strategies with disciplined execution and risk control — the way a systematic desk actually operates.',
      courses:['cycle-analysis'] },
    { name:'Quantitative Track',       n:24, price:1099, tile:'#b08d3c', slug:'quantitative-track',
      desc:'Statistics, factor models, Python, strategy research.',
      blurb:'The quant core: statistics that matter, factor models, Python and rigorous strategy research — the closest thing to a buy-side research bootcamp online.',
      courses:['statistics-for-technicians'] },
    { name:'AI & Machine Learning',    n:18, price:1199, tile:'#cdab57', slug:'ai-ml-track',
      desc:'ML models, feature engineering, alpha from data.',
      blurb:'Apply modern machine learning to markets — feature engineering, sentiment and behavioral signals, and building models that find real, durable alpha.',
      courses:['behavioral-finance'] },
  ],

  courses: [
    { title:'Trend Analysis', cat:'Technical', instr:'Marcus Chen', initials:'MC', price:349, hours:'8.5', lessons:62, level:'Intermediate', rating:'4.9', tag:'Bestseller', accent:'#8a6d1f', slug:'trend-analysis', thinkificSlug:'trend-analysis', featured:true, order:1,
      description:'Read trend, structure and momentum the way a desk does. Build a repeatable framework for entries, exits and risk across any liquid market.',
      modules:[ {title:'Foundations of Trend', lessons:['What trend really is','Higher highs & market structure','Timeframe alignment']}, {title:'Execution', lessons:['Entry triggers','Stop placement','Scaling & exits']}, {title:'Risk', lessons:['Position sizing','Drawdown control']} ] },
    { title:'Chart Pattern Analysis', cat:'Technical', instr:'Priya Nair', initials:'PN', price:299, hours:'7', lessons:52, level:'Beginner', rating:'5.0', tag:'Popular', accent:'#b8923c', slug:'chart-pattern-analysis', thinkificSlug:'chart-pattern-analysis',
      description:'Classic and modern chart patterns, objectively defined — so you can spot, qualify and trade them without guesswork.',
      modules:[ {title:'Reversal Patterns', lessons:['Head & shoulders','Double tops/bottoms']}, {title:'Continuation Patterns', lessons:['Flags & pennants','Triangles']} ] },
    { title:'Technical Indicators', cat:'Technical', instr:'Marcus Chen', initials:'MC', price:329, hours:'9', lessons:64, level:'Intermediate', rating:'4.8', tag:'', accent:'#cdab57', slug:'technical-indicators', thinkificSlug:'technical-indicators',
      description:'Moving averages, oscillators and volume tools — what they measure, where they fail, and how to combine them without redundancy.',
      modules:[ {title:'Trend & Momentum', lessons:['Moving averages','MACD','RSI']}, {title:'Volume & Volatility', lessons:['OBV','ATR & Bollinger Bands']} ] },
    { title:'Statistics for Technicians', cat:'Quant', instr:'Sofia Reyes', initials:'SR', price:399, hours:'11', lessons:78, level:'Advanced', rating:'4.9', tag:'Bestseller', accent:'#b08d3c', slug:'statistics-for-technicians', thinkificSlug:'statistics-for-technicians', featured:true, order:2,
      description:'The statistics that actually matter for trading: distributions, expectancy, significance and how to avoid fooling yourself with backtests.',
      modules:[ {title:'Core Statistics', lessons:['Distributions','Expectancy & edge']}, {title:'Validation', lessons:['Significance testing','Overfitting & walk-forward']} ] },
    { title:'Cycle Analysis', cat:'Systematic', instr:'James Whitfield', initials:'JW', price:379, hours:'9', lessons:58, level:'Advanced', rating:'4.7', tag:'', accent:'#b8923c', slug:'cycle-analysis', thinkificSlug:'cycle-analysis',
      description:'Identify, measure and trade market cycles — turning periodicity into timing models you can systematise.',
      modules:[ {title:'Cycle Foundations', lessons:['Periodicity basics','Detrending']}, {title:'Applied Cycles', lessons:['Composite cycles','Building a timing model']} ] },
    { title:'Behavioral Finance & Sentiment', cat:'AI', instr:'David Brenner', initials:'DB', price:449, hours:'12', lessons:84, level:'Advanced', rating:'4.9', tag:'New', accent:'#9a7b2e', slug:'behavioral-finance', thinkificSlug:'behavioral-finance', featured:true, order:3,
      description:'Quantify crowd psychology. Turn sentiment, positioning and flow data into signals using modern ML techniques.',
      modules:[ {title:'Sentiment Data', lessons:['Sources & cleaning','Positioning & flow']}, {title:'Modelling', lessons:['Feature engineering','From signal to strategy']} ] },
  ],

  instructors: [
    { name:'Marcus Chen',      initials:'MC', role:'Technical Analysis & Price Action', cred:'Former Goldman Sachs Trader',     courses:4, students:'32K', photo:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&w=520&h=620&q=80' },
    { name:'Dr. Amara Okafor', initials:'AO', role:'Systematic & Quant Trading',        cred:'Ex-BlackRock Quant PM',           courses:3, students:'27K', photo:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=520&h=620&q=80' },
    { name:'Sofia Reyes',      initials:'SR', role:'Quant Trading & Python',            cred:'CFA · Quant Researcher',          courses:5, students:'41K', photo:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&crop=faces&w=520&h=620&q=80' },
    { name:'James Whitfield',  initials:'JW', role:'Algorithmic & Systematic Trading',  cred:'Systematic Hedge Fund Founder',   courses:2, students:'19K', photo:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&crop=faces&w=520&h=620&q=80' },
    { name:'Priya Nair',       initials:'PN', role:'Technical Trading & Chart Patterns',cred:'Prop Trader & Educator',          courses:6, students:'58K', photo:'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=520&h=620&q=80' },
    { name:'David Brenner',    initials:'DB', role:'AI & Machine Learning for Trading', cred:'Ex-Two Sigma ML Engineer',        courses:4, students:'23K', photo:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=faces&w=520&h=620&q=80' },
  ],

  // Marquee of institutions instructors have worked at (brand wordmarks).
  logos: ['Bloomberg','Goldman Sachs','BlackRock','Morgan Stanley','J.P. Morgan','Fidelity','Two Sigma','Citadel','Barclays','UBS'],

  faqs: [
    { q:'Can I buy just one course?', a:'Yes — that’s how Meridian works by default. Tick any courses you want, build a custom bundle, and check out. Or open a single course and enroll directly. No subscription required.' },
    { q:'Do I need a finance background?', a:'No. Courses are tiered from Beginner to Advanced, and every instructor builds from first principles.' },
    { q:'Are the certificates recognized?', a:'You earn a verified certificate for every completed course, shareable to LinkedIn. Many learners use them to support CFA, FMVA and promotion cases.' },
    { q:'Do you offer team or university pricing?', a:'Yes. See the For Organizations section for corporate seat licensing, academic pricing, and fully custom programs.' },
    { q:'What if a course isn’t right for me?', a:'Every purchase is backed by a 30-day money-back guarantee — no questions asked.' },
  ],
};

/* ---------- helpers ---------- */
const ACCENTS = ['#8a6d1f','#b8923c','#b08d3c','#cdab57','#b8923c','#9a7b2e'];
const esc  = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hexA = (hex,a) => { const h=String(hex||'#8a6d1f').replace('#',''); const r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16); return `rgba(${r},${g},${b},${a})`; };
const initialsOf = (name) => String(name||'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const slugify = (s) => String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

/* ---------- Thinkific URL resolution (the only place URLs are built) ---------- */
function courseUrl(c){
  if (c.enrollUrl) return c.enrollUrl;
  const base = 'https://' + THINKIFIC.domain;
  if (THINKIFIC.useDirectEnroll && c.thinkificCourseId) return base + '/enroll/' + c.thinkificCourseId;
  return base + '/courses/' + (c.thinkificSlug || c.slug || '');
}
function bundleUrl(p){
  if (p.enrollUrl) return p.enrollUrl;
  return 'https://' + THINKIFIC.domain + '/bundles/' + (p.thinkificSlug || p.slug || '');
}
// Internal branded detail pages (our pages — never Thinkific's marketing pages).
function coursePageUrl(c){ return 'course.html?slug=' + encodeURIComponent(c.slug || c.thinkificSlug || slugify(c.title)); }
function bundlePageUrl(p){ return 'bundle.html?slug=' + encodeURIComponent(p.slug || p.thinkificSlug || slugify(p.name)); }
function instructorPageUrl(t){ return 'instructor.html?slug=' + encodeURIComponent(t.slug || slugify(t.name)); }
function signInUrl(){ return 'https://' + THINKIFIC.domain + THINKIFIC.signInPath; }

/* ---------- SEO / share helpers (so OUR pages get indexed, not Thinkific's) ---------- */
function siteBase(){ return (THINKIFIC.siteUrl || location.origin).replace(/\/$/,''); }
// Absolute URL to a page on this site, honouring THINKIFIC.siteUrl or the current dir.
function pageUrl(file, query){
  const q = query ? ('?' + query) : '';
  if (THINKIFIC.siteUrl) return siteBase() + '/' + file + q;
  const dir = location.pathname.replace(/[^/]*$/, '');
  return location.origin + dir + file + q;
}
function setCanonical(url){
  let l = document.querySelector('link[rel="canonical"]');
  if (!l){ l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); }
  l.href = url;
}
function setMeta(attr, key, val){
  let m = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!m){ m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m); }
  m.setAttribute('content', val);
}
// Apply title + description + Open Graph + Twitter + canonical in one call.
function applyMeta({ title, description, url, image, type='website' }){
  if (title) document.title = title;
  const img = image || pageUrl('assets/bloomberg-poster.jpg', '');
  setCanonical(url);
  setMeta('name','description', description || '');
  setMeta('property','og:type', type);
  setMeta('property','og:title', title || '');
  setMeta('property','og:description', description || '');
  setMeta('property','og:url', url);
  setMeta('property','og:image', img);
  setMeta('property','og:site_name', 'Meridian Finance Academy');
  setMeta('name','twitter:card', 'summary_large_image');
  setMeta('name','twitter:title', title || '');
  setMeta('name','twitter:description', description || '');
  setMeta('name','twitter:image', img);
}
function setJsonLd(obj){
  let s = document.getElementById('ld-json');
  if (!s){ s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-json'; document.head.appendChild(s); }
  s.textContent = JSON.stringify(obj);
}

/* ---------- normalizers (map raw Thinkific-ish objects → our shape) ---------- */
function normalizeCourse(c, i){
  const slug = c.slug || c.thinkificSlug || slugify(c.title || c.name);
  return {
    title: c.title || c.name || 'Untitled course',
    cat: c.cat || c.category || 'Courses',
    instr: c.instr || c.instructor || '',
    initials: c.initials || initialsOf(c.instr || c.instructor || ''),
    price: Number(c.price) || 0,
    hours: c.hours || '',
    lessons: c.lessons || 0,
    level: c.level || 'All levels',
    rating: c.rating || '5.0',
    tag: c.tag || '',
    accent: c.accent || ACCENTS[i % ACCENTS.length],
    slug,
    thinkificSlug: c.thinkificSlug || c.slug || '',
    thinkificCourseId: c.thinkificCourseId || c.id || '',
    enrollUrl: c.enrollUrl || '',
    description: c.description || '',
    modules: Array.isArray(c.modules) ? c.modules : [],
    // HOME-PAGE CURATION (controlled from Thinkific): add the keyword `featured`
    // to a course to put it on the home page; `featured-2`, `featured-3`… set order.
    featured: c.featured === true || /(^|,)\s*featured/i.test(c.keywords || ''),
    order: Number(c.order) || (function(){ const m=/featured-(\d+)/i.exec(c.keywords||''); return m?+m[1]:0; })(),
  };
}

/* Compact course card (shared by the home featured grid + the full catalog page). */
function courseCardHtml(c){
  return `<a href="${coursePageUrl(c)}" class="card card-hover" style="text-decoration:none; color:#1a241c; display:block; background:#fff; border:1px solid #e4e2d9; border-radius:16px; overflow:hidden;">
    <div style="position:relative; height:140px; overflow:hidden; background:linear-gradient(150deg, ${hexA(c.accent,.10)}, #ffffff); border-bottom:1px solid #e8e6dd;">
      <svg viewBox="0 0 360 140" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%;">
        <polyline points="0,110 60,94 120,102 180,66 240,80 300,42 360,54" fill="none" stroke="${c.accent}" stroke-width="2.5"></polyline>
      </svg>
      ${c.tag ? `<span style="position:absolute; top:12px; right:12px; padding:5px 11px; border-radius:6px; background:${c.accent}; color:#fff; font-size:11px; font-weight:700;">${esc(c.tag)}</span>`:''}
      <span class="mono" style="position:absolute; bottom:11px; left:13px; padding:4px 9px; border-radius:6px; background:rgba(255,255,255,.9); border:1px solid #e4e2d9; font-size:11px; color:#4a5260;">${esc(c.cat)}</span>
      <span class="mono" style="position:absolute; bottom:11px; right:13px; font-size:11px; color:#6a7280;">${esc(c.level)}</span>
    </div>
    <div style="padding:18px 20px 20px;">
      <div style="display:flex; align-items:center; gap:9px; margin-bottom:11px;">
        <span class="serif" style="width:26px; height:26px; flex:none; border-radius:50%; background:#eef0ec; border:1px solid #e0ddd2; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:11px; color:#8a6d1f;">${esc(c.initials)}</span>
        <span style="font-size:13px; color:#6a7280;">${esc(c.instr)}</span>
      </div>
      <h3 style="font-family:'Newsreader',serif; font-weight:500; font-size:21px; line-height:1.16; margin:0 0 12px;">${esc(c.title)}</h3>
      <div style="display:flex; gap:9px; font-size:12px; color:#8a92a0; margin-bottom:16px; flex-wrap:wrap;">
        <span>${esc(c.hours)} hrs</span><span>·</span><span>${c.lessons} lessons</span><span>·</span><span style="color:#b08d3c;">★ ${esc(c.rating)}</span>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; padding-top:14px; border-top:1px solid #ece9e0;">
        <div class="serif" style="font-size:24px; color:#1a241c;">$${c.price}</div>
        <span style="padding:9px 16px; border-radius:8px; border:1px solid #8a6d1f; color:#8a6d1f; font-size:13px; font-weight:600;">View course</span>
      </div>
    </div>
  </a>`;
}
// Featured (curated) courses for the home page, sorted by `order`, capped at `limit`.
function featuredCourses(courses, limit){
  let list = courses.filter(c => c.featured);
  if (!list.length) list = courses.slice();
  list = list.slice().sort((a,b) => (a.order||999) - (b.order||999));
  return limit ? list.slice(0, limit) : list;
}
function normalizeInstructor(t, i){
  const name = t.name || ((t.first_name||'') + ' ' + (t.last_name||'')).trim() || 'Instructor';
  return {
    name,
    slug: t.slug || slugify(name),
    initials: t.initials || initialsOf(name),
    role: t.role || t.title || '',
    cred: t.cred || t.headline || '',
    bio: t.bio || '',
    courses: t.courses || 0,
    students: t.students || '—',
    photo: t.photo || t.avatar_url || '',
  };
}
function normalizePath(p, i){
  // `courses` = member-course slugs/ids/objects, used to render "what's included".
  const courses = Array.isArray(p.courses) ? p.courses
                : Array.isArray(p.course_slugs) ? p.course_slugs : [];
  return {
    name: p.name || p.title || 'Learning path',
    desc: p.desc || p.description || '',
    blurb: p.blurb || p.long_description || p.desc || p.description || '',
    n: p.n || p.courses_count || courses.length || 0,
    tile: p.tile || ACCENTS[i % ACCENTS.length],
    price: Number(p.price) || 0,
    slug: p.slug || p.thinkificSlug || slugify(p.name || p.title),
    thinkificSlug: p.thinkificSlug || p.slug || '',
    enrollUrl: p.enrollUrl || '',
    courses,
  };
}
function normalizeLogo(l){ return (typeof l === 'string') ? { name:l, img:'' } : { name:l.name||'', img:l.img||l.logo||'' }; }

/* ---------- live fetch: returns normalized catalog or null ---------- */
async function fetchCatalog(){
  if (!THINKIFIC.catalogEndpoint) return null;
  try {
    const res = await fetch(THINKIFIC.catalogEndpoint, { headers:{ 'Accept':'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    const out = {};
    if (Array.isArray(d.courses)     && d.courses.length)     out.courses     = d.courses.map(normalizeCourse);
    if (Array.isArray(d.instructors) && d.instructors.length) out.instructors = d.instructors.map(normalizeInstructor);
    if (Array.isArray(d.paths)       && d.paths.length)       out.paths       = d.paths.map(normalizePath);
    if (Array.isArray(d.bundles)     && d.bundles.length)     out.paths       = d.bundles.map(normalizePath); // alias
    if (Array.isArray(d.logos)       && d.logos.length)       out.logos       = d.logos.map(normalizeLogo);
    return out;
  } catch (e) {
    console.warn('[Thinkific] live catalog unavailable — using built-in data.', e);
    return null;
  }
}

/* Wire any "Log in" link to Thinkific sign-in (present on every page). */
if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-thinkific="signin"]').forEach(a => a.href = signInUrl());
}
