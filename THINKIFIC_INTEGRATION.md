# Meridian × Thinkific — Portal Setup Playbook (Grow plan)

This site (`index.html` + the branded `course.html` / `bundle.html` / catalog pages)
is a **standalone marketing front end**. Thinkific is the back office — it owns
courses, video, accounts, payments, quizzes, certificates and progress. The site's
job is to present the brand and catalog beautifully, then hand the visitor off to
**Thinkific checkout** to buy and learn.

**The goal of this setup:** the non-technical team manages *everything* inside the
Thinkific admin. They never touch website code. Add a course in Thinkific → it
appears on the site automatically. That automatic link is the **Thinkific Admin API**,
which is included on your **Grow plan**.

```
  Thinkific admin (team edits here)
        │   Admin API (secret key)
        ▼
  api/catalog.js  ── caches + reshapes ──►  meridian.js (fetchCatalog)
  (Vercel function)                             │
                                                ▼
                       index.html · course.html · bundle.html · courses.html
                                                │  "Enroll"
                                                ▼
                                        Thinkific checkout
```

Two files matter to a developer; the team touches neither:

| File | Role |
|---|---|
| `meridian.js` | One config block (`THINKIFIC`) + the data layer + demo fallback. |
| `api/catalog.js` | The Vercel serverless function that holds the API key and serves the live catalog. |

---

## One-time setup (≈30 minutes, done once by a developer)

### Step 1 — Get the Thinkific API key
Thinkific admin → **Settings → Code & Analytics → API** (Grow plan and up).
Create an **API key**. Note two values:
- **API key** (a long secret — treat like a password).
- **Subdomain** — the part before `.thinkific.com` in your school URL
  (`meridian.thinkific.com` → subdomain is `meridian`).

### Step 2 — Deploy the function (Vercel, free)
The endpoint lives at **`api/catalog.js`** in this repo. Vercel auto-detects the
`api/` folder, so deploying the repo gives you the endpoint `/api/catalog`.
1. [vercel.com](https://vercel.com) → **Add New → Project** → import this repo
   (or run `npx vercel` from the repo root). No build step needed — it's a static
   site plus one function.
2. Project → **Settings → Environment Variables** → add to **Production + Preview**:
   - `THINKIFIC_API_KEY` = the key from Step 1
   - `THINKIFIC_SUBDOMAIN` = your subdomain (e.g. `meridian`)
3. **Deploy.** Your endpoint is `https://<project>.vercel.app/api/catalog`.
4. **Test it:** open that URL in a browser. You should see JSON with `courses`,
   `instructors`, `bundles`, `logos`. (First load is slower; after that it's CDN-cached.)

> **Where does the static site live?** Two fine options:
> - **Keep it on GitHub Pages** (current setup) and use Vercel *only* for the
>   function. CORS is open, so the github.io site can call the vercel.app endpoint.
> - **Host the whole site on Vercel** too (it serves the static files + the
>   function from one origin — simplest, and same-origin means no CORS at all).
>   If you go this route you can retire the gh-pages workflow.

### Step 3 — Point the site at the function
In **`meridian.js`**, set two fields:

```js
const THINKIFIC = {
  domain: 'meridian.thinkific.com',                         // your school (or custom) domain
  catalogEndpoint: 'https://<project>.vercel.app/api/catalog',  // ← the Vercel endpoint
  useDirectEnroll: true,                                     // Enroll → Thinkific checkout directly
  // ...
};
```

Commit + redeploy the static site. On load, every page calls `fetchCatalog()`, pulls
the live catalog, and rebuilds the home grid, filter chips, learning paths, course
pages and bundle pages from Thinkific. If the endpoint is blank or a fetch fails, the
site silently falls back to the demo data in `meridian.js`, so it never breaks.

### Step 4 — Verify field mapping against your real data
Thinkific accounts vary slightly. Open the `/api/catalog` JSON and sanity-check:
- **Prices** show correctly (the function reads `course.price`; adjust `priceOf()` if
  your account nests price under a product).
- **Instructor names** resolve on courses (the function matches `course.user_id` →
  instructor; some accounts use `instructor_id` — both are handled, but confirm).

These are 1-line tweaks in `api/catalog.js`, called out in its comments. Everything
else is automatic.

---

## ⭐ Day-to-day: how the team runs the site (all inside Thinkific)

Once setup is done, this is the entire workflow. Changes appear on the site within
~10 minutes (the proxy cache window).

| In Thinkific you do this… | …the website does this automatically |
|---|---|
| Publish a **course** + set its **Price** | New course card in the catalog + its own branded `course.html` page |
| Edit a course **name / price / subtitle** | Updates everywhere (subtitle = the marketing description) |
| Assign a course **Author (instructor)** | Instructor name shows on the card and course page |
| Create a **Bundle** (several courses, one price) | New **Learning path** card → branded `bundle.html` → bundle checkout |
| Add tokens to a course's **Keywords** box (see below) | Controls Featured placement, category, level, hours, ribbon |
| **Unpublish / archive** a course or bundle | It drops off the site |

### The Keywords cheat-sheet (the only "marketing" control)
Course → **Settings → SEO → Keywords**. Type any of these comma-separated tokens.
All optional — leave them out and the course still shows with sensible defaults.

| Token | Effect | Example |
|---|---|---|
| `featured-1` | Put on the **home page**, position 1 (`-2`, `-3`… set order) | `featured-1` |
| `cat:Name` | Catalog **category** + filter chip | `cat:Technical` |
| `level:Name` | **Level** badge | `level:Advanced` |
| `hours:N` | "**N hrs**" on the card | `hours:8.5` |
| `tag:Word` | Corner **ribbon** | `tag:Bestseller` |

**Full example** in one Keywords box:
`featured-2, cat:Quant, level:Advanced, hours:11, tag:Bestseller`

> Brand-only items a developer sets once (not course content): the hero clips,
> the FAQ text, and the institutions marquee list (in `api/catalog.js` → `CONFIG.logos`).

---

## Checkout, SEO & domain

**Enroll → Thinkific checkout, not their marketing pages.** With
`useDirectEnroll: true`, every Enroll button uses `https://{domain}/enroll/{courseId}`
(the course id comes from the live feed). Bundles link to `…/bundles/{slug}`. Your
branded pages stay the destination search engines see.

**SEO — your pages get indexed, not Thinkific's.** Every page emits a `canonical`
tag, Open Graph/Twitter tags and JSON-LD, and all internal links point at *your*
`course.html` / `bundle.html`. For extra safety, in Thinkific set each course's
landing page canonical to your `course.html?slug=…`.

**Sitemap.** `sitemap.xml` + `robots.txt` are included. Regenerate from the **live**
Thinkific feed so they always match what's published:
```bash
node build-sitemap.mjs https://your-final-domain https://<project>.vercel.app/api/catalog
```
Run it on a schedule (e.g. a nightly GitHub Action) once live sync is on.

**Custom domain.** To serve the site at e.g. `academy.meridian.com`: point a CNAME at
GitHub Pages, add a `CNAME` file, and set `siteUrl: 'https://academy.meridian.com'` in
`meridian.js` (drives canonical/share URLs). Until then it runs at the github.io URL.

---

## Notes & limits

- **Rate limit:** Thinkific allows 120 API requests/min. The proxy caches the whole
  assembled catalog (default 10 min), so the API is hit only ~once per cache window
  regardless of site traffic. Tune `CONFIG.cacheSeconds`.
- **Lesson counts / curriculum:** the basic `/courses` payload may not include lesson
  counts; the card hides the "lessons" stat when absent. To show exact curriculum on
  `course.html`, extend the proxy to call `/courses/{id}/chapters` and attach `modules`
  (commented in `api/catalog.js`).
- **Instructors listing:** the homepage faculty grid and the all-instructors listing
  are **retired for now** (per request). `instructor.html` and the instructor data
  remain in place, so restoring is a markup-only change — see the comment block where
  the section used to live in `index.html`.
- **"Build your own bundle" multi-course cart:** Thinkific has no native multi-product
  cart. Use **Bundle** products (recommended) for any "several courses, one price"
  offer — they appear automatically as Learning paths.

---

## Quick checklist

- [ ] Courses + prices created in Thinkific; Bundles created for learning paths
- [ ] API key generated (Settings → Code & Analytics → API)
- [ ] Repo deployed to Vercel; `THINKIFIC_API_KEY` + `THINKIFIC_SUBDOMAIN` set as env vars
- [ ] `https://<project>.vercel.app/api/catalog` returns JSON with courses/instructors/bundles
- [ ] `meridian.js` → `domain` + `catalogEndpoint` set; site redeployed
- [ ] Spot-check prices + instructor names in the `/api/catalog` JSON
- [ ] (Optional) Featured/category/level tokens added to course Keywords
- [ ] (Optional) custom domain + `siteUrl`; scheduled `build-sitemap.mjs`

Once the proxy is live and `catalogEndpoint` is set, the site is fully Thinkific-driven:
the team works only in Thinkific, and the marketing front end keeps itself in sync.
