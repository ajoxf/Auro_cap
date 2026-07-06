# Cowork Task Prompt — Remove the `learn.fincoursa.com` subdomain

> Paste everything below the line into a Claude Cowork session with access to my **GoDaddy**
> account (and my **Thinkific** and **Vercel** dashboards if needed). Do NOT paste passwords/keys.

---

`learn.fincoursa.com` is currently showing a random/placeholder page and is even ranking on
Google. I do **not** want a `learn` subdomain right now. **Remove it cleanly** so it stops
resolving and drops off search. My real site is `fincoursa.com` — **do not touch that, `www`, or
my email records.**

## Step 0 — Diagnose first (report before deleting)
1. **GoDaddy → My Products → Domains → fincoursa.com → DNS / Manage DNS.**
2. Find the record whose **Host/Name = `learn`** (it will be a **CNAME** or **A** record).
   Note its **type and value** and tell me what it points to (e.g. a Thinkific host, a GoDaddy
   parking value, etc.). Also check GoDaddy **Forwarding** for any `learn.fincoursa.com` forward.
3. Tell me what you found, then proceed to remove it (Step 1).

## Step 1 — Delete the `learn` DNS record (GoDaddy)
- **Delete ONLY the record with Host = `learn`** (the CNAME/A pointing the subdomain somewhere).
- If GoDaddy has a **Forwarding** rule for `learn.fincoursa.com`, delete that too.
- **Do NOT touch** any of these:
  - the apex `@` record (that's `fincoursa.com` → Vercel),
  - the `www` record,
  - any **MX** records (email),
  - any **TXT** records (SPF/DKIM/domain verification),
  - any other subdomain.
- If you're unsure whether a record is the right one, **stop and ask me** with the record details.

## Step 2 — Disconnect it on the host side (so nothing keeps serving it)
- **Thinkific:** Settings → look for a **Custom domain** entry for `learn.fincoursa.com`. If one
  exists, **remove/disconnect it** so Thinkific no longer answers on that hostname. (Leave the
  school itself and its default `ankit-s-site-31c5.thinkific.com` address untouched.)
- **Vercel:** open the **auro-cap** project → **Settings → Domains**. If `learn.fincoursa.com` is
  listed there, **remove it**. (Leave `fincoursa.com` and `www.fincoursa.com` exactly as they are.)

## Step 3 — Verify
- After ~10–30 min (DNS propagation), `https://learn.fincoursa.com` should **no longer load the
  page** (it should fail to resolve or show nothing). Confirm this.
- Confirm `https://fincoursa.com` and `https://www.fincoursa.com` **still work normally** (the
  FinCoursa site loads with the gold logo).

## Step 4 — Get it out of Google (optional but helpful)
- If I have **Google Search Console** access for the domain, use **Removals → Temporarily remove**
  and submit `learn.fincoursa.com` to speed its removal from search results. (Otherwise it will
  drop off on its own once the subdomain stops resolving and Google re-crawls — can take days.)

## Guardrails
- Only delete the **`learn`** record (and any `learn` forwarding). Never touch `@`, `www`, MX, or
  TXT records, or the `fincoursa.com` domain on Vercel.
- Don't change the Thinkific school's default domain or any site code.
- If anything is ambiguous, stop and ask me with the exact record/setting details.

## Report back
1. The `learn` record you deleted (host, type, value) and any forwarding you removed.
2. Whether `learn.fincoursa.com` was also configured on Thinkific and/or Vercel (and that you
   removed it there).
3. Confirmation that `learn.fincoursa.com` no longer loads and that `fincoursa.com` / `www` still work.

Goal: `learn.fincoursa.com` is fully removed and no longer serves any page; `fincoursa.com` and
`www.fincoursa.com` are untouched and working.
