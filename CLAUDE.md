# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KC Digital Drive Market v3 — a full-stack marketplace for technology equipment donations between donors and community-based organizations (CBOs). Built with React + Vite (frontend) and Express.js (backend), using Supabase for the database and Clerk for authentication.

## Development Commands

## Package Manager

**Always use `pnpm`** for this project — never `npm` or `yarn`.

### Local Development (3 terminals)
```bash
# Terminal 1: Supabase full stack (Postgres, Auth, Storage, Studio, etc.)
cd backend && pnpm db:start

# Terminal 2: Express API server (port 4000)
cd backend/api && pnpm dev

# Terminal 3: Vite frontend (port 3000)
cd frontend-vite && pnpm dev
```

> `pnpm db:start` runs the full Supabase stack via the Supabase CLI (managed by `backend/supabase/config.toml`). The legacy `backend/x_docker-compose.yml.legacy` is kept for reference only — do not use.

### Frontend (`frontend-vite/`)
```bash
pnpm dev             # Dev server on port 3000
pnpm build           # tsc && vite build
pnpm lint            # ESLint
pnpm lint:fix        # Auto-fix lint issues
pnpm format          # Prettier
pnpm type-check      # TypeScript validation
pnpm test:a11y       # Accessibility tests (axe-core)
```

### Backend (`backend/api/`)
```bash
pnpm start           # Run server (port 4000)
pnpm dev             # Auto-reload with node --watch
pnpm lint            # ESLint
```

### Database (Supabase CLI)
```bash
cd backend && pnpm db:push          # Apply migrations to local DB
cd backend && pnpm db:reset         # Reset local DB (wipes data, re-runs all migrations + seed)
cd backend && pnpm db:start         # Start local Supabase stack
cd backend && pnpm db:stop          # Stop local Supabase stack
cd backend && pnpm db:status        # Show keys + URLs
```

> **Supabase CLI usage rule** — never install the Supabase CLI globally (no `brew install supabase`, no `npm i -g supabase`, no `supabase ...` calls relying on PATH). The CLI is pinned in `backend/package.json` devDependencies and invoked exclusively via `pnpx supabase ...` (or the `pnpm db:*` scripts above). For commands the scripts do not cover (e.g. `pnpx supabase link --project-ref xyz`, `pnpx supabase login`, `pnpx supabase migration new <name>`), run `pnpx supabase ...` from the `backend/` directory. This keeps the CLI version locked across all machines and matches CI behavior.

### Local Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/health
- Supabase Studio: http://localhost:54323
- Email testing (Inbucket): http://localhost:54324

## Architecture

### Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **Auth**: Clerk (JWT) synced to Supabase via custom hook
- **Database**: Supabase (PostgreSQL 15) with Row-Level Security
- **Payments**: Stripe (frontend Elements + backend webhooks)
- **State**: Zustand (installed; stores added in Phase 5)
- **Forms**: React Hook Form + Zod validation
- **Backend**: Express.js (payment + request lifecycle handling)

### Directory Structure
```
frontend-vite/src/
├── App.tsx              # Root with Clerk + Supabase + Router providers
├── config/index.ts      # Centralized config for all env vars + feature flags
├── routes/index.tsx     # All React Router v6 route definitions
├── layouts/             # MainLayout (wraps pages with Navbar)
├── pages/
│   ├── organizations/   # Public org profiles (inline-editable for owners)
│   ├── donor/           # Donor dashboard, profile (cause-area alerts), donations
│   ├── cbo/             # CBO dashboard, requests, profile management
│   ├── admin/           # Admin dashboard + vetting/users/audit/requests tabs
│   ├── legal/           # privacy, terms, accessibility, cpsia, do-not-sell, sitemap
│   ├── CampaignPage.tsx, CampaignDonatePage.tsx   # Campaign feature pages
│   ├── FaqPage.tsx, ContactPage.tsx               # Static info pages
│   ├── WelcomePage.tsx, PaymentSuccess/Cancel.tsx
├── components/
│   ├── ui/              # 24 shadcn/ui components (Radix-based)
│   ├── home/            # HeroSection, BentoGridSection, ContentBlockSection, FeaturesSection, StatsSection, etc.
│   ├── organization/    # Profile tabs + AddTeamMemberDialog, PostUpdateDialog (owner CRUD)
│   ├── requests/        # FulfillDialog, DenyDialog, AcceptPledgeDialog, ConfirmReceiptDialog, InKindPledgeDialog
│   ├── notifications/   # NotificationsBell, NotificationsList
│   ├── Footer.tsx       # Site footer with newsletter subscribe
│   ├── NoticeBanner.tsx # Top-of-page announcement bar
│   ├── AdminRoute.tsx   # /admin guard (uses useRealUserType for impersonation safety)
│   └── ErrorBoundary.tsx
├── hooks/
│   ├── useClerkSupabase.ts   # Syncs Clerk user → Supabase user_profiles
│   └── useNotifications.ts   # In-app notification feed (Phase 5)
├── stores/              # Zustand stores (Phase 5)
├── lib/
│   ├── supabase.ts      # Supabase client + all DB helper functions
│   ├── stripe.ts        # Stripe Promise init + createPaymentIntent
│   ├── api.ts           # Authenticated fetch wrapper for backend API (Phase 4)
│   └── utils.ts         # Helpers (cn, formatCurrency, etc.)
└── types/database.ts    # TypeScript types matching DB schema

backend/
├── api/
│   ├── server.js                  # Express server: payments + Stripe Connect + webhook (Vercel serverless export)
│   ├── middleware/clerkAuth.js    # Clerk JWT verification (@clerk/backend)
│   ├── services/pdfGenerator.js   # PDF donation receipts + annual summaries (pdfkit)
│   └── routes/
│       ├── requests.js            # POST /fulfill, /deny, /confirm-in-kind-receipt
│       ├── inKind.js              # POST /pledge, /accept, /reject (Phase 8.5)
│       └── users.js               # POST /become-cbo, /sync (bypasses RLS trigger)
└── supabase/
    ├── migrations/      # SQL migration files (run in order)
    ├── config.toml      # Supabase CLI config (Clerk registered as third-party auth)
    └── seed.sql         # DB seed data (taxonomy + mock orgs/donors/requests/campaigns)

_docs/                   # Project documentation and history (canonical doc folder)
├── status.md            # Implementation status by phase
├── plan.md              # Feature roadmap and phase definitions
├── tasks.md             # Task list with acceptance criteria
├── architecture.md      # Architecture decisions
├── setup.md             # Local dev setup guide
├── deployment.md        # Deployment notes
├── stripe-webhook.md    # Stripe webhook flow documentation
├── clerk-supabase-auth.md  # Clerk JWT validation in Supabase (Third-Party Auth)
└── debug-payment-flow.md   # Debug walkthrough: BUG-8 → BUG-11 cascade
```

### Authentication Flow
1. User signs in via Clerk
2. `useClerkSupabase` hook calls backend `POST /api/users/sync` to create/update Supabase `user_profiles` (server-side bypasses RLS trigger)
3. Supabase client is initialized with a Clerk `accessToken` getter; every query carries the Clerk JWT so RLS policies see `clerk_user_id()`
4. Frontend uses the **publishable key** for data queries (`VITE_SUPABASE_PUBLISHABLE_KEY`, formerly `anon`); RLS enforces access
5. Backend uses the **secret key** (`SUPABASE_SECRET_KEY`, formerly `service_role`) for webhook/admin operations

### Payment Flow
1. Donor initiates donation → frontend calls `POST /api/payments/create-intent` with `requestId` + Clerk JWT header
2. Backend resolves `donorId` from JWT, reads canonical `amount` from DB (never from client body) → creates Stripe PaymentIntent with metadata
3. Frontend renders Stripe CardElement for card entry
4. On success, Stripe sends webhook → `POST /api/payments/webhook`
5. Backend verifies signature, checks idempotency via `stripe_events` table, updates `requests` (status=claimed, donor_id, payment_intent_id), notifies CBO via `request_notifications`

### Request Lifecycle
```
open → claimed (via Stripe webhook on payment_intent.succeeded)
claimed → fulfilled (CBO action: POST /api/requests/fulfill)
claimed → denied (CBO action: POST /api/requests/deny)
open → denied (CBO action: POST /api/requests/deny)
claimed → open (automatic: on charge.refunded webhook)
```

### Database Schema (key tables)
Core:
- `user_profiles` — Clerk user ID (TEXT) + `user_type` (donor/cbo/admin); `id` is no longer FK-bound to `auth.users` after `20260518000000_clerk_user_id_text.sql`
- `donor_profiles` — donor-specific data (display_name, bio, max_per_request, cause-area match preferences)
- `organizations` — CBO profiles (logo_url, mission, cover_image_url, social_links, `ages_served`, `pre_eligibility_status`)
- `requests` — equipment donation requests with status enum + payment_intent_id + Phase 8 form-depth fields (`donation_type`, `device_type_breakdown`, `need_frequency`, etc.)
- `request_notifications` — in-app notification log (recipient_id, is_read, supports `match_alert` type)
- `fulfillment_records` — tracks completed donations with method + tracking
- `request_history` — audit log of status transitions
- `in_kind_pledges` — Phase 8.5 device pledges (donor commits a physical device instead of cash); status `pending|accepted|rejected`
- `donor_cause_areas` — Phase 9 donor opt-in to cause-area match alerts (junction; trigger inserts notifications on matching requests)

Campaigns (from main):
- `campaigns` — fundraising campaigns by orgs (funding_goal, amount_raised, story_content)
- `campaign_questions` — visitor-submitted FAQs awaiting org review

Payments / Stripe Connect:
- `payment_transactions` — full ledger of donations including fee splits
- `stripe_events`, `stripe_connect_events` — idempotency guards for webhook events
- `platform_settings` — platform fee configuration

Documents:
- `organization_documents` — CBO-uploaded files (501c3, financials, etc.)
- `donor_documents`, `tax_documents` — donor-facing receipts and annual summaries (PDF)

Misc:
- `support_faqs`, `support_contact_info` — donor dashboard help content
- `newsletter_subscriptions` — footer signup form
- `organization_updates`, `organization_team_members`, `organization_populations` — public profile content
- `admin_activity_log` — admin action audit

Junction tables: `organization_cause_areas`, `request_challenge_categories`, `request_identity_categories`.

All tables use RLS; migrations are in `backend/supabase/migrations/`.

**Important column-name reconciliations:**
- `organizations.logo_url` (was `logo`; reconciled in `20260427000000_schema_reconcile.sql`)
- `request_notifications.recipient_id` (was `user_id`; reconciled in the same migration)
- `request_notifications.is_read` (was `read`)
- `user_profiles.id` is **TEXT** (Clerk user ID) since `20260518000000_clerk_user_id_text.sql`; no FK to `auth.users`
- `donor_cause_areas.donor_id` (NOT `user_id`; standardized during the 2026-05-18 merge)

## Environment Variables

**Frontend (`frontend-vite/.env.local`):**
```
VITE_CLERK_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=KC Digital Drive Market
VITE_ENVIRONMENT=development
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_REALTIME=true
```

**Backend (`backend/api/.env`):**
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SUPABASE_URL=
SUPABASE_SECRET_KEY=
CLERK_SECRET_KEY=
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
```

All frontend env vars are accessed through `frontend-vite/src/config/index.ts`.

## Key Conventions

- **Path alias**: `@/` maps to `frontend-vite/src/` — use this for all imports
- **Component library**: Use existing shadcn/ui components from `src/components/ui/` before creating new ones
- **Config**: All feature flags and environment access go through `src/config/index.ts`
- **TypeScript**: Strict mode — `noUnusedLocals` and `noUnusedParameters` enforced
- **Supabase queries**: Use helpers from `src/lib/supabase.ts`; never use service role key in frontend
- **Amount handling**: Never trust `amount` from client body — always read from DB in backend
- **Notifications**: Insert into `request_notifications` with `recipient_id` (not `user_id`)
- **Migrations**: Never edit existing migration files — always add a new migration file

## Adding a new DB table — required workflow

Any migration in `backend/supabase/migrations/` that introduces a new table must include all of the following in the **same** migration file. Splitting these across multiple migrations historically caused BUG-12 (RLS enabled with zero policies → silent block of all non-service-role traffic). See `_docs/debug-payment-flow.md` for the full case study.

Checklist for any new-table migration:

- [ ] `CREATE TABLE`
- [ ] `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] `CREATE POLICY` for SELECT (public, or owner-scoped)
- [ ] `CREATE POLICY` for INSERT / UPDATE / DELETE (owner-scoped via `public.clerk_user_id()`)
- [ ] Indexes on FK columns (Postgres does NOT auto-index FKs)

After the user runs `pnpm db:push` (or `db:reset`), Claude must automatically run this validation query and report any table with `rls_enabled = true` and `policy_count = 0`:

```bash
docker exec -i supabase_db_backend psql -U postgres -c "
SELECT
  t.tablename,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY rls_enabled DESC, policy_count ASC;
"
```

Result interpretation:

- `rls_enabled = true` + `policy_count ≥ 1` → safe
- `rls_enabled = true` + `policy_count = 0` → **silent block, fix before reporting done**, unless the table is explicitly service-role-only (e.g. `stripe_events`) — in that case the migration must contain a comment stating this intent

This validation is not optional. It runs every time a migration touches a table, whether the user asks for it or not.

## Documentation

All project documentation lives in `_docs/`. Do not create doc files elsewhere.

| File | Contents |
|------|----------|
| `_docs/status.md` | Phase-by-phase implementation status (source of truth) |
| `_docs/plan.md` | Feature roadmap and phase definitions |
| `_docs/tasks.md` | Task list with acceptance criteria |
| `_docs/architecture.md` | Architecture decisions |
| `_docs/setup.md` | Local dev setup guide |
| `_docs/deployment.md` | Deployment notes |
| `_docs/stripe-webhook.md` | Stripe webhook flow documentation |
| `_docs/clerk-supabase-auth.md` | How Supabase validates Clerk JWTs (Third-Party Auth) for RLS |
| `_docs/debug-payment-flow.md` | Postmortem: BUG-8 → BUG-11 cascade. Symptom-by-symptom debug walkthrough for the Clerk/Supabase integration |

**Phases 1–9 (Batch A) are complete.** See `_docs/status.md` for the per-phase breakdown.

Most recently merged from `origin/main` (2026-05-18): full homepage design system (Hero/Bento/Stats/Footer), Stripe Connect + platform fees, campaigns feature with rich-text editor, admin redesign + user management, FAQ/Contact/Legal pages, Vercel serverless backend, PDF receipt pipeline.

In-flight: Phase 9 Batches B–D (Tax receipts, Impact reports), Phase 10 (Public Impact).

## File Naming Conventions

- **`x_` prefix** marks a file or folder as **deprecated / unused**. Treat it as read-only history — do not edit, link to, or rely on it. Examples: `x_docs/` (legacy v3 setup docs, kept for archival only). When something becomes deprecated, rename it with the `x_` prefix instead of deleting, so it's visually flagged and easy to find later if needed.
- **`_` prefix** (e.g. `_docs/`, `_scripts/`) marks a folder as **project-meta** — documentation, scripts, or tooling that lives alongside code but isn't part of the runtime build.
- **`z_` prefix** marks a file as **personal scratch** — gitignored via `z_*` in `.gitignore`, never committed. Use for ad-hoc test scripts, throwaway queries, or local-only notes. Sorts to the bottom of file listings so it stays out of the way.

## CI/CD

GitHub Actions in `.github/workflows/`:
- `frontend-ci.yml` — lint, type-check, a11y tests on PRs
- `backend-ci.yml` — lint and quality checks
- `pr-checks.yml` — PR label validation

Production deploys frontend to Vercel, backend as Express server, database on Supabase Cloud.
