# Cowork Task Prompt — Thinkific Portal Cleanup & End-to-End Setup

> Paste everything below the line into a Claude Cowork session that has access to the
> Thinkific school. Fill in the two bracketed spots if needed. Do NOT paste any API keys.

---

You are acting as a **site admin** for my **Thinkific school**, working through the Thinkific
admin dashboard UI (`/manage`) exactly as a human admin would — navigating the menus, editing
courses/products/pricing, and testing the live site. Your job is to clean up the catalog and get
the **entire student journey working end-to-end**, so that a real, polished set of courses is
live and anyone can discover → enroll → learn → get a certificate without friction.

## Background you must understand first

- **School:** `ankit-s-site-31c5.thinkific.com` (admin at `/manage`). Plan: **Grow** (Admin API enabled).
- This Thinkific school is the **single source of truth** for a separate white-label marketing
  website ("Meridian Finance Academy", hosted at `auro-cap.vercel.app`). The website reads
  Thinkific automatically through the Admin API and mirrors whatever is in Thinkific — I do
  **not** edit the website to add/remove courses. So whatever you change in Thinkific is what
  the public site will show. **Thinkific is the control panel; the website just reflects it.**
- Because of that, these Thinkific rules directly control the public site:
  - A course/bundle appears on the website **only if its Product is `published`** and **not
    `hidden`** and **not `private`**. Anything in **Draft** is hidden from the site.
  - "**Archive**" (Manage Learning Content) is NOT the same as unpublishing and does **not**
    reliably remove an item from the site. **To take something off the site, set its Product to
    Draft, or delete it.** Do not rely on "Archive" for visibility.
  - Every paid Product needs a **Price** with a `price_id`; the site uses it for direct checkout.
  - An **instructor only appears on the site if they have at least one published course.**
  - **Bundles** show up on the site as "Learning Paths."

## Current known state (verify — may have changed)

- 2 courses exist: **"IV. Chart Pattern Analysis"** (Product = Draft, $0) and **"Mastering
  Trends: Spot, Analyze, and Leverage"** (slug `ai-placeholder-1`, Product = **Published**, $0).
- 2 bundles exist, both Draft: **"Test"** ($199) and **"Test 1"** ($399).
- Several of these look like **test / AI-placeholder artifacts** (names like "Test", "Test 1",
  slug "ai-placeholder-1"). These are almost certainly **unwanted**.

## Integrate seamlessly with the existing website (IMPORTANT — don't break the sync)

The website already knows how to read this school. Configure Thinkific using these exact
conventions so everything flows through automatically with **no code changes**:

- **Core fields pulled automatically** (just fill them in on each course, in Thinkific):
  - Course **Name** → course title on the site.
  - Course **Subtitle** → the short description shown on cards/detail.
  - **Price** (via the Product's primary Price) → price shown + used for checkout.
  - **Instructor** → the assigned instructor's name/photo/bio (fill their profile in Thinkific).
  - **Course card image** → the course thumbnail on the site.
  - **Bundles** → shown as "Learning Paths" (give each bundle member courses + a price).
- **Marketing polish via the course Keywords box** (Course → Settings → SEO → **Keywords**).
  These optional tokens are how the site controls layout — use them, don't hard-code anything:
  - `featured-1` → feature on the home page in position 1 (`featured-2`, `-3`… for order)
  - `cat:Technical` → catalog category / filter chip
  - `level:Intermediate` → level badge
  - `hours:8.5` → shows "8.5 hrs"
  - `tag:Bestseller` → corner ribbon
  - Example Keywords value: `featured-2, cat:Quant, level:Advanced, hours:11, tag:Bestseller`
- **Badges are automatic — do NOT fake them.** The site auto-adds **Free** (price 0), **New**
  (created in last 30 days), and **Featured** (from the `featured` keyword). Just set price and
  keywords correctly and the badges appear on their own.
- **Naming matters** — use clean, professional, final titles. Remove throwaway names ("Test",
  "Test 1") and placeholder slugs ("ai-placeholder-1"); don't leave partial/numbered fragments
  unless the series is intentional.
- **The sync is safe when empty** — if at some point zero courses are published, the site shows a
  tasteful "New courses coming soon" state (it will NOT show fake demo content), so publish only
  when ready. The end goal, though, is a full set of real published courses.
- **For paid direct checkout to work**, every paid Product must have a **primary Price** (that's
  what gives the site the `price_id` it needs). Free courses should be set to a real **Free**
  price and will route through Thinkific's own "Enroll for Free" sign-up.

## Your objectives (do them in order)

### 1. Full audit
Produce a table of **every** course, bundle, product, price, and instructor, with: name, type,
Product status (published/draft), hidden/private flags, price + `price_id`, instructor, and
enrolled-student count. Flag anything that looks like a **test/demo/placeholder** (test names,
"ai-placeholder" slugs, $0 throwaways, empty curriculum, zero real content).

### 2. Remove unwanted courses (CONFIRM WITH ME FIRST)
- Present the list of items you believe are junk and **ask me to confirm before deleting.**
- For anything with **enrolled students**, do NOT delete — flag it and ask; deletion can remove
  student access/records.
- For confirmed junk with no students: **delete** the course/bundle and its product entirely.
- For real-but-not-ready items: set the Product to **Draft** (don't delete).

### 3. Get the real catalog into shape
For each course I want live:
- Ensure it has a real **title, subtitle, description, course card image**, and a proper
  **curriculum** (chapters + lessons) — no empty shells.
- Assign the correct **instructor** (with name, bio, and avatar filled in on their profile).
- Set **pricing**: decide Free vs Paid. For paid, create a one-time Price and note its `price_id`.
  For free, confirm the price is set to **Free** (not just $0 with a broken price).
- **Publish** the Product (status = published, not hidden, not private) only when it's ready.

### 3b. De-duplicate & clean up instructors
The site currently receives **duplicate and placeholder instructor records** — e.g. **"Meet Test"
appears multiple times** (one with a photo/bio, the rest empty) and there is an **"Ankit Jhaveri"**
record with no role/bio/photo. Duplicates and empty profiles look unprofessional on the site.
- **Find duplicate instructors** (same or near-same name, or the same person entered twice).
- **Keep ONE canonical profile per real person** — the most complete one (name, role, bio, avatar) —
  and **reassign every course** from the duplicate(s) to that canonical instructor.
- **Delete the empty/duplicate instructor records** once no course points at them (an instructor with
  no assigned course disappears from the site anyway, but remove the junk records to keep it tidy).
- **Rename test/placeholder instructors** (e.g. "Meet Test") to the real person's name, or delete them
  if they aren't a real instructor. Confirm with me before deleting anyone you're unsure about.
- Every remaining instructor should have a **real name, role/title, short bio, and a headshot** —
  the site pulls all of these automatically. (Default/blank Thinkific avatars are shown as initials,
  so upload a real photo where you want one.)

### 4. Fix the enrollment flow (this is currently broken — highest priority)
Test and make the following work **in a fresh incognito window as a brand-new student** (NOT as
the school owner — the owner already "owns" everything and is not a valid test):
- **Free course:** clicking Enroll should show sign-up → create account → immediate access to the
  course player. Confirm the student lands in the course and can start lesson 1.
- **Paid course:** Enroll should go straight to a **checkout/payment page**, complete payment
  (use a test transaction or a real small price), and grant access. Confirm a **receipt email**
  is sent and the course appears in the student's **My Courses / dashboard** (`/enrollments`).
- Fix whatever blocks this in **Settings → Payments, Site → Sign-up, and each Product's pricing.**
  Common culprits: Product set to Private, no valid price, payment gateway not connected, sign-up
  disabled. Resolve them.
- Confirm **certificates** are enabled and issue on course completion (if I want them).

### 5. 1:1 Coaching product (for the website's "Book a 1:1 session" buttons)
- Create a **Coaching / paid Product** named "1:1 Coaching Session" (or per-instructor coaching
  products if that's cleaner) with a one-time Price.
- If per-instructor: create one coaching product per active instructor so revenue can be tracked
  to each.
- **Report back the coaching Product id(s) + `price_id`(s)** so the website's "Book a 1:1"
  buttons can be wired to direct checkout. (I'll paste these into the site config.)

### 6. Revenue split for instructors/coaching
- Set up each instructor as a **Revenue Partner** (Settings → Revenue Partners) with an agreed
  commission %, so Thinkific auto-tracks their share of course + coaching sales. Ask me for the
  % per instructor if not specified: [ % TO CONFIRM ].

### 7. Emails & polish
- Turn on **order/receipt emails**, **welcome email**, and **course-completion** emails.
- Make sure the **post-purchase redirect** sends students into the course player or their dashboard.

## Guardrails
- **Never delete anything with enrolled students** without explicit confirmation from me.
- **Always confirm the delete list with me before deleting.**
- **Test the student journey in incognito**, never as the logged-in owner.
- Don't change the school's custom domain, API keys, or integrations.
- Make changes in Thinkific only — you do not need to touch the website's code; it syncs
  automatically.

## Final deliverable (report back to me)
1. What you deleted / drafted / published (before-and-after catalog table).
2. Confirmation the free AND paid enrollment flows work in incognito (with the steps you tested).
3. The **coaching Product id(s) + price_id(s)**, and any **paid course price_ids**, in a clean
   list so I can wire them into the website.
4. Any remaining issues that need my decision (pricing, which courses are "real", revenue %).

Goal: after you're done, the public site should show ONLY real, polished, published courses,
with a smooth enroll-and-learn flow, working coaching checkout, and correct revenue tracking.
