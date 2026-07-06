# Cowork Task Prompt — Redirect `learn.fincoursa.com` → `fincoursa.com`

> Paste everything below the line into a Claude Cowork session with access to my **Vercel**,
> **GoDaddy**, and **Thinkific** dashboards. Do NOT paste any passwords/keys.

---

`learn.fincoursa.com` currently shows a random/placeholder page (and is ranking on Google). I want
it to **301-redirect to my main site `https://fincoursa.com`** — same site, no separate subdomain.
Do NOT touch `fincoursa.com`, `www`, or my email records.

## Step 0 — Diagnose first (report before changing)
1. **GoDaddy → Domains → fincoursa.com → DNS / Manage DNS.** Find the record with **Host = `learn`**
   (a CNAME or A). Note its **type + value** and tell me what it points to.
2. Check **GoDaddy → Forwarding** for any existing `learn.fincoursa.com` forward.
3. **Thinkific → Settings:** check whether `learn.fincoursa.com` is set as a **Custom domain**.
4. Report what you found, then proceed.

## Step 1 — Stop the old target from serving it
- **Thinkific:** if `learn.fincoursa.com` is set as a Custom domain, **remove/disconnect it**
  (leave the school and its default `ankit-s-site-31c5.thinkific.com` address untouched).
- We'll replace the `learn` DNS record in the next step.

## Step 2 — Set up the redirect (PREFERRED: via Vercel, gives proper HTTPS + 301)
1. **Vercel → open the `auro-cap` project → Settings → Domains → Add.** Enter `learn.fincoursa.com`.
2. When Vercel asks how to configure it, choose **"Redirect to another domain"** and set the target
   to **`fincoursa.com`** with a **Permanent (301/308)** redirect. Save.
3. Vercel will show the **DNS record** it needs for `learn` (a **CNAME** → `cname.vercel-dns.com`,
   or an A record — use exactly what Vercel shows).
4. **GoDaddy → DNS:** update the **`learn`** record to that Vercel target:
   - Delete the existing `learn` CNAME/A (the old Thinkific/placeholder one).
   - Add a **CNAME**: Host `learn`, Value = the value Vercel showed (e.g. `cname.vercel-dns.com`).
5. Wait for Vercel to show `learn.fincoursa.com` as **Valid** (it auto-issues SSL). This can take
   10–60 min.

### Simpler ALTERNATIVE (only if the Vercel route is a problem): GoDaddy Subdomain Forwarding
- **GoDaddy → fincoursa.com → Forwarding → Add subdomain forwarding.**
- Subdomain `learn` → forward to `https://fincoursa.com`, **Permanent (301)**, **Forward only**
  (NOT "forward with masking"). Save. (GoDaddy will replace the `learn` DNS record automatically —
  allow it.) Note: GoDaddy's HTTPS on forwarded subdomains can lag; prefer the Vercel route above.

## Step 3 — Verify
- After propagation, opening **`https://learn.fincoursa.com`** should **redirect to
  `https://fincoursa.com`** (the address bar ends on `fincoursa.com`, valid padlock).
- Confirm `https://fincoursa.com` and `https://www.fincoursa.com` **still load normally**.

## Step 4 — (Optional) speed up Google
- If I have **Google Search Console** access, submit `https://fincoursa.com` for re-indexing. The
  301 will make Google consolidate `learn.fincoursa.com` into `fincoursa.com` over the next crawls.

## Guardrails
- Only change the **`learn`** record/forwarding. Never touch the apex `@` (fincoursa.com → Vercel),
  `www`, **MX** (email), or **TXT** records, or the `fincoursa.com`/`www` domains on Vercel.
- Don't change the Thinkific school's default domain or any website code.
- If a record is ambiguous, stop and ask me with the exact details.

## Report back
1. What the old `learn` record pointed to, and the new record/redirect you configured.
2. Whether `learn.fincoursa.com` was on Thinkific/Vercel and that you cleaned it up.
3. Confirmation that `learn.fincoursa.com` now 301-redirects to `fincoursa.com` over HTTPS, and that
   `fincoursa.com` / `www` still work.

Goal: `learn.fincoursa.com` permanently redirects to `https://fincoursa.com`; the main site, `www`,
and email are untouched.
