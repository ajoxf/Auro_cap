# Connecting the Meridian landing page to Thinkific

This landing page (`index.html`) is a **standalone marketing front end**. It does
not host courses, video, or payments itself — Thinkific does. The page's job is to
present the brand, the catalog, the faculty and the pricing story, then **hand the
visitor off to Thinkific** to enrol, pay, and actually take the course.

Everything Thinkific-related is driven by **one config block** near the top of the
`<script>` in `index.html`:

```js
const THINKIFIC = {
  domain: 'YOUR-SCHOOL.thinkific.com',  // your Thinkific (or custom) domain
  signInPath: '/users/sign_in',
  useDirectEnroll: false,
};
const MERIDIAN_DATA = { courses: [ ... ], instructors: [ ... ], ... };
```

You should never need to touch the HTML or rendering code to keep the catalog in
sync — only `THINKIFIC` and `MERIDIAN_DATA`.

---

## The model: this page is the storefront, Thinkific is the back office

```
  Visitor → index.html (this page) → "Enroll" → Thinkific course/checkout
                                                      │
                                          payment, account, video,
                                          quizzes, certificate, progress
```

Because the page links *out* to Thinkific, it works on **any Thinkific plan** and
needs **no API key, no server, and no secrets**. Host it anywhere static
(Vercel, Netlify, GitHub Pages, S3, or your own domain).

---

## Seeing the portal (preview & deploy)

This is a static site (`index.html` + `assets/scroll-sequence.mp4` + `vendor/`), so
"the portal" is just those files served over **http/https**. It must be served, not
opened from disk — the cinematic hero uses ES modules and a video, which browsers
block on `file://`.

**Locally (fastest):**
```bash
cd Auro_cap
python3 -m http.server 8000
# open http://localhost:8000
```

**Live URL via GitHub Pages:** the repo has a `gh-pages` branch, so Pages is the
natural host. In **GitHub → Settings → Pages**, set the source to the branch/folder
you want to publish; the site then lives at
`https://<user>.github.io/Auro_cap/`. Publishing = copying `index.html`, `assets/`,
and `vendor/` onto the published branch. (Ask and I can push the current build to
`gh-pages` for you.)

> The cinematic Bloomberg hero needs a browser with **H.264** support — every normal
> desktop/mobile browser has it. If the clip ever fails to load, the page detects it
> and gracefully drops the cinematic act, showing the standard light hero instead, so
> the portal is never blocked.

---

## Step 1 — Create the courses in Thinkific

1. In Thinkific Admin, build each course under **Manage Learning Content → Courses**.
2. Set each course's **price** (one-time) under the course's **Pricing** tab so the
   Thinkific checkout matches the price shown on this page.
3. Note each course's **URL slug** — it's the last part of the course landing URL:
   `https://YOUR-SCHOOL.thinkific.com/courses/`**`trend-analysis`**.

## Step 2 — Point this page at your school

In `index.html`, set your domain:

```js
const THINKIFIC = {
  domain: 'meridian.thinkific.com',   // ← your real domain (or custom domain)
  signInPath: '/users/sign_in',
  useDirectEnroll: false,
};
```

The **Log in** link in the nav is wired automatically from `domain + signInPath`.

## Step 3 — Map each course to its Thinkific course

Every entry in `MERIDIAN_DATA.courses` has three Thinkific fields. Fill in
**one** of them per course (slug is the simplest):

| Field | When to use it | Resulting URL |
|---|---|---|
| `thinkificSlug` | Default. Send the visitor to the course landing page. | `https://{domain}/courses/{slug}` |
| `thinkificCourseId` + `useDirectEnroll:true` | Skip the landing page, go straight to enrol. | `https://{domain}/enroll/{id}` |
| `enrollUrl` | Full custom link (promo, coupon, bundle). Overrides the other two. | exactly what you set |

Example:

```js
{ title:'Trend Analysis', price:349, /* ...display fields... */
  thinkificSlug:'trend-analysis', thinkificCourseId:'', enrollUrl:'' },
```

The page builds every link in exactly one place — the `courseUrl()` function — so
once these fields are correct, every **Enroll** button, course card, instructor
"View courses" link, and the checkout step all resolve correctly.

## Step 4 — Keep prices in sync

The `price` in `MERIDIAN_DATA` is **display only**. The real charge happens on
Thinkific. Whenever you change a price in Thinkific, update the matching `price`
here so the marketing page and the checkout agree. (Step 6 automates this.)

---

## Handling the "build your own bundle" cart

This page lets a visitor tick several courses and "Enroll selected". Thinkific has
**no native multi-product cart**, so pick one of these:

1. **Thinkific Bundle (recommended).** In Thinkific, create a **Bundle** product
   containing the relevant courses, give it its own price, and put its URL in a
   course's `enrollUrl` — or special-case the bundle handoff in `goToThinkific()`
   to point at a single Bundle URL. Cleanest checkout, one payment.
2. **Sequential checkout (default in this code).** `goToThinkific()` opens each
   selected course's checkout in its own tab. Works with zero Thinkific setup, but
   the visitor pays per course.
3. **API order (advanced).** On Grow/Advanced plans, use the Thinkific API to
   create a single order for multiple courses. Requires a backend (see below).

The handoff lives in one function — search `goToThinkific` in `index.html`.

---

## Optional upgrades

### A. Single sign-on (one account across page + Thinkific)
Thinkific supports **SSO via a signed JWT**. If you add your own auth, you can log a
user into Thinkific by redirecting to
`https://{domain}/api/sso/v2/sso/jwt?jwt=...&return_to=...`. The JWT must be signed
server-side with your **API key as the secret** — never put that key in this page.

### B. Live catalog from the Thinkific API (no more hand-editing) ✅ built in

**The page already supports this.** New courses and instructors you add in Thinkific
will appear here automatically once you point the page at a small proxy — no code
edits, no redeploys. Two parts:

**1. In `index.html`, set the endpoint:**

```js
const THINKIFIC = {
  domain: 'meridian.thinkific.com',
  catalogEndpoint: 'https://your-proxy.workers.dev/catalog',  // ← your proxy URL
  // ...
};
```

On load the page calls `loadCatalog()`, fetches that URL, and rebuilds the catalog,
filter chips, and faculty grid from the response. If the endpoint is `''` or the
fetch fails, it silently keeps the built-in `MERIDIAN_DATA` — so the page never
breaks. The proxy must return:

```json
{
  "courses": [
    { "title":"Trend Analysis", "cat":"Technical", "instr":"Marcus Chen",
      "price":349, "hours":"8.5", "lessons":62, "level":"Intermediate",
      "rating":"4.9", "tag":"Bestseller", "slug":"trend-analysis", "id":123 }
  ],
  "instructors": [
    { "name":"Marcus Chen", "role":"Technical Analysis", "cred":"Former GS Trader",
      "courses":4, "students":"32K", "photo":"https://..." }
  ]
}
```

Only `title` + (`slug` or `id`) are required per course; everything else gets a
sensible default (an accent colour is auto-assigned, rating defaults to 5.0, etc.).
Categories for the filter bar are derived automatically from the courses' `cat`
values, so a new track in Thinkific becomes a new filter chip with no edits.

**2. The proxy (holds your API key — never ships to the browser).** Example
Cloudflare Worker:

```js
export default {
  async fetch(request, env) {
    const H = {
      'X-Auth-API-Key': env.THINKIFIC_API_KEY,     // set as a Worker secret
      'X-Auth-Subdomain': env.THINKIFIC_SUBDOMAIN,  // e.g. 'meridian'
      'Content-Type': 'application/json',
    };
    const api = (path) =>
      fetch('https://api.thinkific.com/api/public/v1/' + path, { headers: H })
        .then(r => r.json());

    const [courses, users] = await Promise.all([
      api('courses?page=1&limit=50'),
      api('users?role=instructor&limit=50').catch(() => ({ items: [] })),
    ]);

    const instrById = Object.fromEntries((users.items || []).map(u => [u.id, u]));
    const out = {
      courses: (courses.items || []).map(c => {
        const u = instrById[c.user_id] || {};
        return {
          title: c.name,
          slug: c.slug,
          id: c.id,
          cat: (c.keywords || '').split(',')[0]?.trim() || 'Courses',
          instr: [u.first_name, u.last_name].filter(Boolean).join(' '),
          // price/lessons/rating aren't in /courses — fetch /products & /chapters
          // here if you want them exact, or set marketing defaults:
          price: 0, lessons: 0, rating: '5.0',
        };
      }),
      instructors: (users.items || []).map(u => ({
        name: [u.first_name, u.last_name].filter(Boolean).join(' '),
        role: u.headline || '', cred: u.bio || '', photo: u.avatar_url || '',
      })),
    };
    return new Response(JSON.stringify(out), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',          // or lock to your domain
        'Cache-Control': 'public, max-age=300',       // 5-min cache
      },
    });
  },
};
```

Notes:
- Thinkific's `/courses` endpoint does **not** include price, lesson count, or
  ratings. If you want those exact, have the proxy also call `/products` (price)
  and `/courses/{id}/chapters` (lesson count) and merge them in. Ratings aren't a
  Thinkific concept — keep them as a marketing field.
- The API key requires a **Grow/Advanced plan**. Set it as a Worker secret
  (`wrangler secret put THINKIFIC_API_KEY`) — it must never appear in `index.html`.
- Same pattern works on Vercel/Netlify functions or any tiny server.

### C. Embedding *inside* Thinkific instead of linking out
If you'd rather this design live on your Thinkific domain:
- Thinkific themes are **Liquid**-based. You can paste sections of this markup into a
  **Custom HTML** site section, or into **Settings → Code & analytics** for
  site-wide CSS/JS.
- Constraints: Thinkific wraps pages in its own theme chrome, the Google Fonts links
  must be allowed, and dynamic data is better expressed with Liquid objects
  (`{% for course in courses %}`) than the JS array used here. Treat `index.html` as
  the visual reference and port section-by-section.

### D. Newsletter
The footer "weekly memo" form is decorative. Wire `subscribe()` to your email
provider (ConvertKit, Mailchimp, etc.) or a Thinkific webhook/Zapier hook.

---

## Quick checklist

- [ ] Courses built and priced in Thinkific
- [ ] `THINKIFIC.domain` set to your real domain
- [ ] Every `courses[]` entry has a valid `thinkificSlug` (or `enrollUrl`)
- [ ] Display `price` values match Thinkific prices
- [ ] Bundle strategy chosen (Bundle product vs. sequential vs. API)
- [ ] `Log in` link goes to your Thinkific sign-in page
- [ ] (Optional) API proxy / SSO / newsletter wired up

Once the first four boxes are ticked, the page is production-ready: every button
lands the visitor on the correct Thinkific course, and Thinkific handles payment,
accounts, video, certificates and progress.
