# LUCA Amsterdam — Booking, Admin, Hermes

End-to-end booking site for LUCA Amsterdam — sauna, ice baths, massages.

- **Customer site** (`index.html`, `reserve.html`, …) — static HTML + vanilla CSS + React 18 (UMD).
- **Booking flow** — `reserve.jsx` → posts to `/.netlify/functions/create-booking` → writes to Supabase → sends confirmation email via Resend.
- **Admin dashboard** — `admin.html` + `admin.jsx`, Linear-style. Bookings, schedule, customers, CSV import, Hermes agent management.
- **Database** — Supabase Postgres with RLS.
- **Backend** — Netlify Functions (Node 22).
- **Email** — Resend (transactional). Confirmation + cancel links.
- **Hermes** — outbound API for the user's external automation agent. See `implementation-notes.html` §7.

Full decision log: open `implementation-notes.html` in a browser.

---

## Local setup (one-time)

```bash
# 1. Install dependencies
npm install

# 2. Build compiled JS from JSX
npm run build
```

`npm run build` compiles `reserve.jsx`, `admin.jsx`, and the tweaks panel into the corresponding `.js` files. The Netlify build runs this automatically — local builds are only needed if you want to preview your JSX changes before pushing.

---

## Deploy from scratch

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, paste and run **`db/schema.sql`**.
3. Then paste and run **`db/seed.sql`**.
4. Settings → API. Copy:
   - `Project URL` → use as `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never in browser)

### 2. Resend (email)

1. Create an account at [resend.com](https://resend.com).
2. Verify the sending domain (e.g. `luca-amsterdam.nl`). You'll need DNS records.
3. Create an API key → use as `RESEND_API_KEY`.

### 3. Netlify

1. Connect this repo to a Netlify site (or use the existing one — `709fe3d7-c91b-4627-b95c-05a110f0a398`).
2. Site settings → **Environment variables**, add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://<project>.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJh…` (anon, public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJh…` (service role, server-only) |
| `RESEND_API_KEY` | `re_…` |
| `LUCA_FROM_EMAIL` | `LUCA Amsterdam <reserveringen@luca-amsterdam.nl>` |
| `LUCA_REPLY_TO` | *(optional)* operator inbox |

3. Trigger a deploy. Build runs `npm install && npm run build`.

### 4. First admin user

After Netlify is live:

1. Open `<your-site>/admin.html`. The login screen renders but you can't sign in yet.
2. In Supabase **Authentication → Users**, invite or create a user with email + password.
3. In **SQL editor**:
   ```sql
   insert into admin_profiles (id, full_name, role)
   values ('<the new user id>', 'You', 'admin');
   ```
4. Refresh `/admin.html` and sign in.

---

## Smoke test the deploy

Walk through this once, on a phone, after deploy:

- [ ] **Marketing site** — `/index.html` loads, hero video plays, nav works.
- [ ] **Booking** — `/reserve.html` → pick a service → date → time → fill details → confirm → the confirmation screen shows a real `LUC-XXXXXX` reference and a cancel link.
- [ ] **Email** — Confirmation arrives in your inbox (NL or EN per language toggle).
- [ ] **Cancel link** — Open from the email, confirm cancel, screen flips to "cancelled".
- [ ] **Admin login** — `/admin.html` → sign in with the admin user.
- [ ] **Booking appears in admin** — the booking you just made is in `#/bookings`, click row → drawer opens, change status to `completed`.
- [ ] **Schedule** — `#/schedule` shows the booking on the right day in week view, then day view.
- [ ] **Customers** — `#/customers` lists the email you booked with. Open the drawer, see the booking attached.
- [ ] **Import** — Drop a CSV with `email`, `full_name`, `phone` columns. Preview shows mappings + dedupe. Commit. New customers appear.
- [ ] **Hermes** — `#/hermes` → create an agent → copy the key (only shown once). Use `curl` from the cheat sheet to GET past clients — works. POST an activity event — shows up in the feed.
- [ ] **Keyboard** — `g b`, `g s`, `g c`, `g i`, `g h`, `⌘K` all work.

---

## Folder layout

```
luca-amsterdam-new/
├─ index.html, voorzieningen.html, prijzen.html, locatie.html, faq.html,
│  huisregels.html, over-luca.html                      # Marketing pages
├─ reserve.html, reserve.jsx, reserve.js                # Customer booking
├─ cancel.html                                          # Self-service cancel
├─ admin.html, admin.jsx, admin.js, admin.css           # Operator dashboard
├─ styles.css, reserve.css                              # Customer-side styles
├─ i18n.js                                              # NL + EN dictionary
├─ assets/                                              # Images + video
├─ db/
│  ├─ schema.sql        ← run first
│  ├─ seed.sql          ← run second (idempotent)
│  ├─ migrations/
│  └─ README.md
├─ netlify/functions/
│  ├─ _shared/                                          # Supabase, http, auth, email, csv, validate
│  ├─ create-booking.js, get-booking.js, cancel-booking.js
│  ├─ get-availability.js
│  ├─ import-preview.js, import-commit.js
│  ├─ hermes-past-clients.js, hermes-activity.js
│  ├─ create-agent-key.js
│  └─ public-config.js                                  # exposes SUPABASE_URL + anon key to admin
├─ netlify.toml
├─ package.json
├─ implementation-notes.html                            # Decision log — read this before pushing back
└─ README.md
```

---

## Customer URLs

- `https://<site>/`               — homepage
- `https://<site>/reserve.html`   — booking
- `https://<site>/cancel.html?ref=…&token=…` — cancel link (in the confirmation email)
- `https://<site>/admin.html`     — operator dashboard (sign in required)

## Hermes API

Two endpoints. Both require `Authorization: Bearer <api_key>` (issued in admin → Hermes).

```bash
# Past clients
curl -H "Authorization: Bearer $LUCA_API_KEY" \
  "https://<site>/api/hermes/past-clients?tag=imported-2025-05&limit=200"

# Post activity
curl -X POST -H "Authorization: Bearer $LUCA_API_KEY" -H "Content-Type: application/json" \
  -d '{"kind":"message_sent","customer_email":"jane@example.com","payload":{"subject":"We missed you"}}' \
  "https://<site>/api/hermes/activity"
```

Allowed `kind` values: `campaign_started`, `campaign_finished`, `message_sent`, `message_failed`, `reply_received`, `meeting_booked`, `booking_recovered`, `unsubscribed`, `note`.

---

## Editing JSX

After editing `reserve.jsx` or `admin.jsx`, rebuild:

```bash
npm run build                   # builds everything
npm run build:reserve           # just the booking flow
npm run build:admin             # just the admin
npm run watch:reserve           # auto-rebuild on save (dev)
```

`reserve.html` / `admin.html` load the compiled `.js`. Do **not** edit `reserve.js` or `admin.js` directly — they'll be overwritten on the next build.

---

## Known gaps & deferred work

See **`implementation-notes.html` §10**. Highlights:

- Payments (Mollie/Stripe) — not wired. Booking happens, no money is taken.
- Resource-level availability — current model is a single capacity per service. Real-world LUCA likely has per-staff/per-room constraints.
- OnlineAfspraken backfill — if there are existing bookings in OA, decide whether to sync or cut over fully.
- Admin invite UI — first admin via SQL; teammates currently added the same way.

---

## Tear-down (dev only)

```sql
-- Wipe everything except seeded services/addons
truncate bookings, customers, import_jobs, hermes_activity, hermes_agents restart identity cascade;
```

`services` and `addons` re-seed with `db/seed.sql` if you blow them away.
