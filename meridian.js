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
  // Sign-in path on Thinkific (default works for all schools):
  signInPath: '/users/sign_in',
  // Course "Enroll" target: course landing page (default) or direct enroll.
  useDirectEnroll: false,
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
    { name:'Technical Trading Track',   n:26, desc:'Price action, indicators, chart patterns, market structure.', tile:'#1f4733', price:899,  slug:'technical-trading-track' },
    { name:'Systematic Trading Track',  n:21, desc:'Rules-based systems, backtesting, execution, risk.',          tile:'#3c6b4f', price:949,  slug:'systematic-trading-track' },
    { name:'Quantitative Track',        n:24, desc:'Statistics, factor models, Python, strategy research.',        tile:'#b08d3c', price:1099, slug:'quantitative-track' },
    { name:'AI & Machine Learning',     n:18, desc:'ML models, feature engineering, alpha from data.',             tile:'#5c7a5f', price:1199, slug:'ai-ml-track' },
  ],

  courses: [
    { title:'Trend Analysis', cat:'Technical', instr:'Marcus Chen', initials:'MC', price:349, hours:'8.5', lessons:62, level:'Intermediate', rating:'4.9', tag:'Bestseller', accent:'#1f4733', slug:'trend-analysis', thinkificSlug:'trend-analysis',
      description:'Read trend, structure and momentum the way a desk does. Build a repeatable framework for entries, exits and risk across any liquid market.',
      modules:[ {title:'Foundations of Trend', lessons:['What trend really is','Higher highs & market structure','Timeframe alignment']}, {title:'Execution', lessons:['Entry triggers','Stop placement','Scaling & exits']}, {title:'Risk', lessons:['Position sizing','Drawdown control']} ] },
    { title:'Chart Pattern Analysis', cat:'Technical', instr:'Priya Nair', initials:'PN', price:299, hours:'7', lessons:52, level:'Beginner', rating:'5.0', tag:'Popular', accent:'#3c6b4f', slug:'chart-pattern-analysis', thinkificSlug:'chart-pattern-analysis',
      description:'Classic and modern chart patterns, objectively defined — so you can spot, qualify and trade them without guesswork.',
      modules:[ {title:'Reversal Patterns', lessons:['Head & shoulders','Double tops/bottoms']}, {title:'Continuation Patterns', lessons:['Flags & pennants','Triangles']} ] },
    { title:'Technical Indicators', cat:'Technical', instr:'Marcus Chen', initials:'MC', price:329, hours:'9', lessons:64, level:'Intermediate', rating:'4.8', tag:'', accent:'#5c7a5f', slug:'technical-indicators', thinkificSlug:'technical-indicators',
      description:'Moving averages, oscillators and volume tools — what they measure, where they fail, and how to combine them without redundancy.',
      modules:[ {title:'Trend & Momentum', lessons:['Moving averages','MACD','RSI']}, {title:'Volume & Volatility', lessons:['OBV','ATR & Bollinger Bands']} ] },
    { title:'Statistics for Technicians', cat:'Quant', instr:'Sofia Reyes', initials:'SR', price:399, hours:'11', lessons:78, level:'Advanced', rating:'4.9', tag:'Bestseller', accent:'#b08d3c', slug:'statistics-for-technicians', thinkificSlug:'statistics-for-technicians',
      description:'The statistics that actually matter for trading: distributions, expectancy, significance and how to avoid fooling yourself with backtests.',
      modules:[ {title:'Core Statistics', lessons:['Distributions','Expectancy & edge']}, {title:'Validation', lessons:['Significance testing','Overfitting & walk-forward']} ] },
    { title:'Cycle Analysis', cat:'Systematic', instr:'James Whitfield', initials:'JW', price:379, hours:'9', lessons:58, level:'Advanced', rating:'4.7', tag:'', accent:'#547a5c', slug:'cycle-analysis', thinkificSlug:'cycle-analysis',
      description:'Identify, measure and trade market cycles — turning periodicity into timing models you can systematise.',
      modules:[ {title:'Cycle Foundations', lessons:['Periodicity basics','Detrending']}, {title:'Applied Cycles', lessons:['Composite cycles','Building a timing model']} ] },
    { title:'Behavioral Finance & Sentiment', cat:'AI', instr:'David Brenner', initials:'DB', price:449, hours:'12', lessons:84, level:'Advanced', rating:'4.9', tag:'New', accent:'#2e6047', slug:'behavioral-finance', thinkificSlug:'behavioral-finance',
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
const ACCENTS = ['#1f4733','#3c6b4f','#b08d3c','#5c7a5f','#547a5c','#2e6047'];
const esc  = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hexA = (hex,a) => { const h=String(hex||'#1f4733').replace('#',''); const r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16); return `rgba(${r},${g},${b},${a})`; };
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
// Internal branded detail page for a course.
function coursePageUrl(c){ return 'course.html?slug=' + encodeURIComponent(c.slug || c.thinkificSlug || slugify(c.title)); }
function signInUrl(){ return 'https://' + THINKIFIC.domain + THINKIFIC.signInPath; }

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
  };
}
function normalizeInstructor(t, i){
  const name = t.name || ((t.first_name||'') + ' ' + (t.last_name||'')).trim() || 'Instructor';
  return {
    name,
    initials: t.initials || initialsOf(name),
    role: t.role || t.title || '',
    cred: t.cred || t.bio || '',
    courses: t.courses || 0,
    students: t.students || '—',
    photo: t.photo || t.avatar_url || '',
  };
}
function normalizePath(p, i){
  return {
    name: p.name || p.title || 'Learning path',
    desc: p.desc || p.description || '',
    n: p.n || p.courses_count || (Array.isArray(p.courses) ? p.courses.length : 0),
    tile: p.tile || ACCENTS[i % ACCENTS.length],
    price: Number(p.price) || 0,
    slug: p.slug || p.thinkificSlug || slugify(p.name || p.title),
    thinkificSlug: p.thinkificSlug || p.slug || '',
    enrollUrl: p.enrollUrl || '',
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
document.querySelectorAll('[data-thinkific="signin"]').forEach(a => a.href = signInUrl());
