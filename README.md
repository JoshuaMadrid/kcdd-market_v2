# KC Digital Drive Market v3

A full-stack marketplace for technology equipment donations between donors and community-based organizations (CBOs) in Kansas City.

**Stack:** React 18 + Vite + TypeScript · Express.js · Supabase (PostgreSQL + RLS) · Clerk (auth) · Stripe (payments) · Tailwind CSS + shadcn/ui

---

## Quick Start (3 terminals)

```bash
# Terminal 1 — Supabase full stack
cd backend && pnpm db:start

# Terminal 2 — Express API (port 4000)
cd backend/api && pnpm dev

# Terminal 3 — Vite frontend (port 3000)
cd frontend-vite && pnpm dev
```

**Access:**
- App: http://localhost:3000
- API health: http://localhost:4000/health
- Supabase Studio: http://localhost:54323
- Email (Inbucket): http://localhost:54324

> Full local setup (env vars, Clerk keys, Stripe CLI, troubleshooting): see [`howtoexecute.local.md`](./howtoexecute.local.md)

---

## Package Manager

This project uses **`pnpm`** exclusively. Do not use `npm` or `yarn`.

---

## Documentation

All project docs live in [`_docs/`](./_docs/):

| File | Contents |
|------|----------|
| [`_docs/status.md`](./_docs/status.md) | Implementation status by phase |
| [`_docs/plan.md`](./_docs/plan.md) | Feature roadmap |
| [`_docs/tasks.md`](./_docs/tasks.md) | Task list with acceptance criteria |
| [`_docs/architecture.md`](./_docs/architecture.md) | Architecture decisions |
| [`_docs/setup.md`](./_docs/setup.md) | Local dev setup |
| [`_docs/deployment.md`](./_docs/deployment.md) | Deployment notes |
| [`_docs/stripe-webhook.md`](./_docs/stripe-webhook.md) | Stripe webhook flow |
| [`_docs/clerk-supabase-auth.md`](./_docs/clerk-supabase-auth.md) | Clerk ↔ Supabase JWT validation (Third-Party Auth) |
| [`_docs/debug-payment-flow.md`](./_docs/debug-payment-flow.md) | Postmortem: BUG-8 → BUG-11 debug walkthrough |

For production deployment: see [`howtodeploy.prod.md`](./howtodeploy.prod.md).
For project conventions and agent guidance: see [`CLAUDE.md`](./CLAUDE.md).

---

## Status

**Phases 1–9 (Batch A) complete.** Latest merge (2026-05-18) brought in the full homepage design system, Stripe Connect, campaigns, admin redesign, PDF receipts, and Vercel serverless deploy. See [`_docs/status.md`](./_docs/status.md) for the full breakdown.

---

## File Naming Conventions

- **`_` prefix** (e.g. `_docs/`, `_scripts/`) → active project-meta folder (docs, scripts, tooling — not part of runtime build)
- **`x_` prefix** (e.g. `x_docs/`) → deprecated / unused — read-only archival, do not edit or rely on
