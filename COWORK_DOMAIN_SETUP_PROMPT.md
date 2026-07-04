# Cowork Task Prompt — Connect fincoursa.com (GoDaddy) to the Vercel site

> Paste everything below the line into a Claude Cowork session that has access to my
> **Vercel** dashboard and my **GoDaddy** account. Do NOT paste any passwords/API keys here.

---

You are helping me connect my newly-purchased domain to my live website. Work carefully and
**confirm with me before any destructive change** (deleting/replacing existing DNS records).

## Facts
- **Domain:** `fincoursa.com` — purchased on **GoDaddy** (DNS is managed at GoDaddy).
- **Host:** **Vercel**, project name **`auro-cap`** (currently live at `auro-cap.vercel.app`).
- **Goal:** `https://fincoursa.com` (and `https://www.fincoursa.com`) should load the site, with a
  valid SSL padlock, `www` redirecting to the bare domain (`fincoursa.com` = primary).
- The website is already built and branded for this domain — you only need to wire up the domain
  and one environment variable. **Do not change any site code.**

## Part A — Add the domain in Vercel
1. Vercel → open the **auro-cap** project → **Settings → Domains**.
2. Add **`fincoursa.com`** and **`www.fincoursa.com`**. Set **`fincoursa.com` as the primary** and
   have **`www` redirect to it** (Vercel offers this automatically — accept it).
3. Vercel will display the **exact DNS records** it wants (an **A record** for the apex `@`, and a
   **CNAME** for `www`). **Copy the exact values Vercel shows** — do not assume; use what's on
   screen. (Typically: A record `@ → 76.76.21.21`, and CNAME `www → cname.vercel-dns.com`, but
   Vercel is the source of truth.)
4. Note them down to enter at GoDaddy in Part B.

## Part B — Add those records at GoDaddy (KEEP GoDaddy nameservers)
Use the **"add DNS records"** method (do NOT switch to Vercel nameservers — that would move all
DNS off GoDaddy and could break email/other services).
1. GoDaddy → **My Products → Domains → fincoursa.com → DNS / Manage DNS**.
2. **Apex record (`fincoursa.com`):**
   - If there's an existing **A record** for host `@` (often GoDaddy's parking IP) — **replace its
     value** with the A record IP Vercel gave (e.g. `76.76.21.21`). If none exists, **add** an A
     record: Host `@`, Value = Vercel's IP, TTL default (600s/1hr).
3. **www record:**
   - **Add/replace a CNAME**: Host `www`, Value = `cname.vercel-dns.com` (or whatever Vercel shows).
   - If GoDaddy has a default `www` CNAME pointing elsewhere, replace it.
4. **Remove GoDaddy Domain Forwarding / parking** if it's enabled for this domain (GoDaddy →
   domain settings → Forwarding) — it can override the records above.
5. **DO NOT touch** any **MX** records (email), **TXT** records (SPF/DKIM/verification), or other
   subdomains. Only the apex `A` and the `www` `CNAME` for the website. If replacing a record,
   confirm with me first and tell me the old value so it's recoverable.

## Part C — Wait & verify SSL
1. DNS changes take **10 min to a few hours** to propagate.
2. Back in Vercel → Settings → Domains, wait until both domains show **"Valid Configuration"**
   (green). Vercel **auto-issues a free SSL certificate** — no action needed.
3. Then load **https://fincoursa.com** and **https://www.fincoursa.com** — both should work, `www`
   should redirect to the bare domain, and the padlock should be valid.

## Part D — Update the crypto-payment site URL (env var)
The crypto checkout uses an env var for building callback/return links; update it to the new domain.
1. Vercel → auro-cap → **Settings → Environment Variables**.
2. Set (create if missing) for **Production** (and Preview):
   - `PUBLIC_SITE_URL = https://fincoursa.com`
3. **Redeploy** the latest Production deployment so the new value takes effect
   (Deployments → latest → ⋯ → Redeploy), or trigger a redeploy from Settings.
4. Do **not** change or reveal other env vars (THINKIFIC_*, CREGIS_*, etc.) — leave them as-is.

## Verification checklist (report pass/fail for each)
- [ ] `https://fincoursa.com` loads the site with the **Fincoursa** logo, over HTTPS (valid padlock).
- [ ] `https://www.fincoursa.com` redirects to `https://fincoursa.com`.
- [ ] Vercel Domains page shows **Valid Configuration** for both.
- [ ] Existing GoDaddy **MX/TXT** (email) records are unchanged.
- [ ] `PUBLIC_SITE_URL` = `https://fincoursa.com` and a redeploy has completed.

## Guardrails
- **Confirm with me before deleting or replacing any existing DNS record** — tell me the old value first.
- Never switch GoDaddy to Vercel nameservers (keep DNS at GoDaddy).
- Don't touch MX/TXT/email records or unrelated subdomains.
- Don't change site code, or any Vercel env var other than `PUBLIC_SITE_URL`.
- Don't expose secrets/passwords/API keys in your messages.

## Report back to me
1. The exact records you added/changed at GoDaddy (host, type, value) and anything you replaced
   (with the old value).
2. Confirmation that both URLs load over HTTPS and `www` redirects correctly.
3. Confirmation that `PUBLIC_SITE_URL` is set and redeployed.
4. Anything that needs my decision or that you couldn't complete.

Goal: `https://fincoursa.com` serves the live site with valid SSL, `www` redirects to it, email/
other DNS untouched, and the crypto checkout pointed at the new domain.
