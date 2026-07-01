# Crypto Checkout (Cregis) + Thinkific Enrollment — Technical Spec

Status: DRAFT for approval. No code built yet. Entity: **Singapore**.

## Goal
Let students pay for a paid course with **crypto via Cregis**, and on confirmed payment,
**automatically create their Thinkific account and enroll them** — identical end result to a
native Thinkific purchase (login, course in dashboard, certificate on completion).

Card / Apple Pay / Google Pay / PayPal stay on **Thinkific's native checkout** (see Payment
Routing). Crypto is the only method that goes through this custom flow. Free courses are
unaffected (they use Thinkific's free "Enroll for Free" sign-up).

## Payment routing (what the Enroll button does)
On a paid course, "Enroll" opens a small **method chooser**:
- **Card / PayPal** → existing Thinkific checkout deep-link (`/enroll/{id}?price_id=...`). No change.
- **Pay with crypto** → our custom Cregis flow below.

> Decision point (verify first): can a **Singapore** Thinkific school connect a direct **Stripe**
> account for card payments? (Thinkific Payments is not available in SG.)
> - If YES → cards + PayPal native, crypto external. (Preferred: least build.)
> - If NO → cards can't be taken natively from SG. Then we also add **Stripe (SG)** to this same
>   external checkout, and ALL enrollment happens via the API. Bigger build, but one branded
>   checkout for everything. Confirm before we finalize scope.

## Architecture (reuses the existing Vercel serverless + Thinkific Admin API)

```
Course detail page (marketing site)
  └─ "Pay with crypto" → collects email + name
       → POST /api/crypto/checkout            (our serverless fn)
            • resolves the course's REAL price server-side (never trust the client)
            • creates a Cregis payment order (amount, metadata, callback URL)
            • stores a pending order (Upstash Redis / Vercel KV)
            • returns Cregis hosted-checkout URL
       → redirect student to Cregis to pay in USDT/USDC/etc.

Cregis (on confirmed on-chain payment)
  └─ POST /api/crypto/webhook                 (our serverless fn)
       • verify Cregis signature
       • if status = paid/confirmed AND not already processed:
            – find-or-create Thinkific user by email  (Admin API)
            – create enrollment for the course        (Admin API POST /enrollments)
            – trigger welcome / set-password email
            – mark order fulfilled (idempotent)
       • return 200

Student
  └─ success page: "Payment received — check your email to set your password and start learning."
     (optional: /api/crypto/status?orderId= polling to update the page live)
```

## Serverless endpoints to build
1. `POST /api/crypto/checkout`
   - Input: `courseId` (Thinkific product/course id), `email`, `name`.
   - Resolve price from Thinkific `product_prices` (primary) SERVER-SIDE.
   - Create Cregis order with metadata `{ orderId, courseId, priceId, email, name, instructor, splitPct }`.
   - Persist pending order; return `{ checkoutUrl }`.
2. `POST /api/crypto/webhook`
   - Verify Cregis callback signature (shared secret).
   - Idempotent fulfillment: enroll once per order even if Cregis retries the callback.
3. `GET /api/crypto/status?orderId=` (optional) — for the success page to poll.

## Thinkific enrollment details (Admin API)
- Find user: `GET /users?query[email]=<email>`; if none, `POST /users` (first_name, last_name, email).
- Enroll: `POST /enrollments` with `{ course_id, user_id, activated_at }` (+ `expiry_date` if timed).
- Access/login: create user with a random password, then send Thinkific's welcome/set-password
  email so the student sets their own password. (Phase 2b option: Thinkific **SSO** — sign a JWT
  with the SSO secret to log them straight into the course after payment; smoother, more work.)

## Data & idempotency
- Small store needed: **Upstash Redis** (Vercel KV). Keys: `order:{orderId}` → status; a
  `processed:{orderId}` flag guarantees enroll-once.
- Idempotency key = `orderId` (also guard on `email+courseId`) to prevent double-enrollment.

## Security
- Prices resolved server-side from Thinkific — client never sends the amount.
- Verify Cregis webhook signature on every callback; reject unsigned/failed.
- Secrets in Vercel env vars: `THINKIFIC_API_KEY` (exists), `CREGIS_API_KEY`, `CREGIS_API_SECRET`,
  `UPSTASH_REDIS_URL/TOKEN`. Nothing secret in the browser.

## Operational reality (things Thinkific normally handles for you)
- **Receipts/invoices:** Thinkific won't email a receipt for external payments → we generate and
  send one (needed for accounting; consider GST/VAT on global sales — get a quick tax opinion).
- **Revenue Partners auto-tracking does NOT apply** to crypto sales → we record `instructor` +
  `splitPct` in the order metadata and you run manual payouts (or export to a sheet).
- **Refunds** are manual crypto sends back to the payer's wallet (stablecoins avoid volatility).
- **Chargebacks:** none with crypto (final settlement) — a plus.
- **FX/fees:** Cregis charges a %; settle in stablecoins to avoid volatility.

## Phasing
- **Phase 1 (days, no code):** Incorporate in SG; enable **PayPal** (+ direct **Stripe** if SG
  allows) in Thinkific → card + PayPal live worldwide immediately.
- **Phase 2 (this build):** Cregis crypto checkout + API enrollment as specced above.
- **Phase 2b (optional):** Thinkific SSO for instant post-payment login; auto-receipt PDFs.

## Open items before build
1. Confirm: can SG Thinkific connect **direct Stripe** for cards? (Sets scope — see Decision point.)
2. **Cregis merchant account** — obtain API key + secret + supported coins/chains + webhook format.
3. Which coins/chains to accept (e.g., USDT on TRON + Ethereum, USDC)?
4. Approve Upstash Redis (or an alternative store) for order state.
5. Receipt/tax handling preference (auto-PDF now, or manual for launch?).
