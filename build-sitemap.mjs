/* Generate sitemap.xml + robots.txt for the catalog.
   Usage:
     node build-sitemap.mjs [https://your-site-url]
       → uses the demo catalog baked into meridian.js (good before live sync).
     node build-sitemap.mjs https://your-site-url https://your-thinkific-proxy/catalog
       → pulls the LIVE catalog from your proxy, so the sitemap always matches what
         the team has published in Thinkific. Run this on a schedule (e.g. nightly
         via a GitHub Action) once live sync is on. */
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const base  = (process.argv[2] || 'https://fincoursa.com').replace(/\/$/, '');
const feed  = process.argv[3] || '';   // optional live proxy URL

// Load meridian.js in a sandbox (no browser) and capture its data + helpers.
let code = readFileSync('meridian.js', 'utf8');
code += '\nthis.__M = { MERIDIAN_DATA, slugify };';
const ctx = { document: { querySelectorAll: () => [] }, location: { origin: '', pathname: '/' }, console };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { MERIDIAN_DATA, slugify } = ctx.__M;

// Prefer the live feed when given; fall back to the demo data in meridian.js.
let courses = MERIDIAN_DATA.courses, paths = MERIDIAN_DATA.paths, instructors = MERIDIAN_DATA.instructors;
if (feed) {
  try {
    const d = await (await fetch(feed, { headers: { Accept: 'application/json' } })).json();
    if (Array.isArray(d.courses) && d.courses.length) courses = d.courses;
    const p = d.paths || d.bundles;
    if (Array.isArray(p) && p.length) paths = p;
    if (Array.isArray(d.instructors) && d.instructors.length) instructors = d.instructors;
    console.log(`Pulled live catalog: ${courses.length} courses, ${paths.length} paths, ${instructors.length} instructors`);
  } catch (e) {
    console.warn('Live feed unavailable — using demo catalog from meridian.js.', e.message);
  }
}

const urls = [
  { loc: base + '/', priority: '1.0' },
  { loc: base + '/courses.html', priority: '0.9' },
];
for (const c of courses)
  urls.push({ loc: `${base}/course.html?slug=${encodeURIComponent(c.slug || c.thinkificSlug || slugify(c.title || c.name))}`, priority: '0.8' });
for (const p of paths)
  urls.push({ loc: `${base}/bundle.html?slug=${encodeURIComponent(p.slug || p.thinkificSlug || slugify(p.name))}`, priority: '0.7' });
for (const t of instructors)
  urls.push({ loc: `${base}/instructor.html?slug=${encodeURIComponent(t.slug || slugify(t.name))}`, priority: '0.6' });

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`;
writeFileSync('sitemap.xml', xml);

writeFileSync('robots.txt', `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`);

console.log(`Wrote sitemap.xml (${urls.length} URLs) + robots.txt for ${base}`);
