/* Generate sitemap.xml + robots.txt from the catalog in meridian.js.
   Usage:  node build-sitemap.mjs [https://your-site-url]
   Re-run after content changes (or have your proxy/build emit it from the live feed). */
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const base = (process.argv[2] || 'https://ajoxf.github.io/Auro_cap').replace(/\/$/, '');

// Load meridian.js in a sandbox (no browser) and capture its data + helpers.
let code = readFileSync('meridian.js', 'utf8');
code += '\nthis.__M = { MERIDIAN_DATA, slugify };';
const ctx = { document: { querySelectorAll: () => [] }, location: { origin: '', pathname: '/' }, console };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { MERIDIAN_DATA, slugify } = ctx.__M;

const urls = [
  { loc: base + '/', priority: '1.0' },
  { loc: base + '/courses.html', priority: '0.9' },
];
for (const c of MERIDIAN_DATA.courses)
  urls.push({ loc: `${base}/course.html?slug=${encodeURIComponent(c.slug || c.thinkificSlug)}`, priority: '0.8' });
for (const p of MERIDIAN_DATA.paths)
  urls.push({ loc: `${base}/bundle.html?slug=${encodeURIComponent(p.slug)}`, priority: '0.7' });
for (const t of MERIDIAN_DATA.instructors)
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
