# KC Digital Drive Market v3 (Vite Edition)

Modern, full-stack marketplace with React + Vite + Clerk + Supabase + Stripe

## Quick Start

```bash
# One-command setup
./setup-vite.sh

# Then start the app (3 terminals)
cd backend && docker-compose up -d              # Terminal 1: Supabase
cd backend/api && npm start                     # Terminal 2: API
cd frontend-vite && npm run dev                 # Terminal 3: Frontend
```

**Access your app:**
- **Application**: http://localhost:3000
- **Database Admin**: http://localhost:54323
- **Email Testing**: http://localhost:54324
- **API Health**: http://localhost:4000/health

---

## Ready to Deploy?

**Simple deployment guide:** [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Step-by-step Vercel deployment  
**Quick checklist:** [DEPLOYMENT_CHECKLIST.txt](./DEPLOYMENT_CHECKLIST.txt) - Print-friendly checklist

**Cost:** FREE using Hobby tiers (Vercel + Clerk + Supabase + Stripe)

---

## Documentation

All documentation is in the [`docs/`](./docs) folder.

**Start here:** [docs/README.md](./docs/README.md) - Documentation hub with navigation

### Quick Links

| Document | Description |
|----------|-------------|
| **[docs/QUICK_START_VITE.md](./docs/QUICK_START_VITE.md)** | Get started in 5 minutes |
| **[docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)** | Complete setup instructions |
| **[docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)** | Next.js to Vite migration guide |
| **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** | **Simple deployment guide** (START HERE!) |
| **[DEPLOYMENT_CHECKLIST.txt](./DEPLOYMENT_CHECKLIST.txt)** | **Print-friendly checklist** |
| **[docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)** | Detailed deployment guide (comprehensive) |
| **[docs/DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)** | Production deployment checklist (detailed) |
| **[docs/GITHUB_ACTIONS_GUIDE.md](./docs/GITHUB_ACTIONS_GUIDE.md)** | CI/CD & accessibility checks |
| **[docs/CI_CD_SETUP_SUMMARY.md](./docs/CI_CD_SETUP_SUMMARY.md)** | Quick CI/CD reference |
| **[docs/IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md)** | What was built (v3) |
| **[docs/DOCUMENTATION_INDEX_VITE.md](./docs/DOCUMENTATION_INDEX_VITE.md)** | Find any documentation |
| **[docs/ARCHIVED_FILES.md](./docs/ARCHIVED_FILES.md)** | Archived files info |
| **[docs/ORGANIZATION_SUMMARY.md](./docs/ORGANIZATION_SUMMARY.md)** | Project organization changes |
| **[docs/DOCS_MOVED.md](./docs/DOCS_MOVED.md)** | Documentation migration notice |
| **[docs/ROOT_FILES_GUIDE.md](./docs/ROOT_FILES_GUIDE.md)** | File organization rules |
| **[docs/CLEANUP_COMPLETE.md](./docs/CLEANUP_COMPLETE.md)** | Cleanup summary |
| **[frontend-vite/README.md](./frontend-vite/README.md)** | Frontend documentation |
| **[backend/api/README.md](./backend/api/README.md)** | Backend API documentation |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | UI framework & build tool |
| **Styling** | Tailwind CSS + shadcn/ui | Styling & components |
| **Auth** | Clerk | User authentication |
| **Database** | Supabase (PostgreSQL) | Data storage & real-time |
| **Payments** | Stripe | Payment processing |
| **API** | Express.js | Payment webhooks |
| **Language** | TypeScript | Type safety |
| **Routing** | React Router v6 | Client-side routing |

---

## Project Structure

```
kcdd-market_v2/
├── docs/                          # All documentation (12 guides)
│   ├── README.md                  # Documentation hub
│   ├── QUICK_START_VITE.md        # 5-minute guide
│   ├── SETUP_GUIDE.md             # Complete setup (15+ pages)
│   ├── MIGRATION_GUIDE.md         # Migration guide
│   ├── VERCEL_DEPLOYMENT.md       # Deploy guide (20+ pages)
│   ├── DEPLOYMENT_CHECKLIST.md    # Deployment checklist
│   ├── GITHUB_ACTIONS_GUIDE.md    # CI/CD guide (20+ pages)
│   ├── CI_CD_SETUP_SUMMARY.md     # CI/CD summary
│   ├── IMPLEMENTATION_SUMMARY.md  # What was built
│   ├── DOCUMENTATION_INDEX_VITE.md # Find anything
│   └── ARCHIVED_FILES.md          # Archive info
│
├── Frontend (Vite)
│   ├── frontend-vite/
│   │   ├── src/
│   │   │   ├── components/        # React components + UI
│   │   │   ├── pages/             # Page components
│   │   │   ├── layouts/           # Layout wrappers
│   │   │   ├── routes/            # Route config
│   │   │   ├── lib/               # Utilities
│   │   │   ├── hooks/             # Custom hooks
│   │   │   ├── config/            # Centralized config
│   │   │   └── types/             # TypeScript types
│   │   ├── .env.example           # Environment template
│   │   ├── vite.config.ts         # Vite configuration
│   │   └── README.md              # Frontend docs
│   │
├── Backend
│   ├── api/                       # Express API server
│   │   ├── server.js              # Main server
│   │   ├── .env.example           # Environment template
│   │   └── README.md              # API docs
│   │
│   ├── supabase/                  # Database
│   │   ├── migrations/            # SQL migrations
│   │   └── config.toml            # Supabase config
│   │
│   └── docker-compose.yml         # Local Supabase
│
├── Root Files
│   ├── README.md                  # Main project documentation
│   ├── setup-vite.sh              # Automated setup script
│   └── .gitignore                 # Git ignore rules
│
└── archive/                       # Old files (in .gitignore)
    ├── old-frontend/              # Next.js v2
    └── old-docs/                  # v2 documentation
```

---

## What's Included

### 26 Beautiful UI Components
- **24 shadcn/ui components** (Button, Card, Dialog, Select, etc.)
- **2 custom components** (RequestCard, Navbar)
- **Fully accessible** (WCAG 2.1 compliant)

### Complete Authentication (Clerk)
- Email/password login
- Social authentication (Google, etc.)
- User management dashboard
- Protected routes
- JWT integration with Supabase

### Payment Processing (Stripe)
- Secure card payments
- Payment intents
- Webhook handling
- Test mode for development
- Production-ready

### Database & Real-time (Supabase)
- PostgreSQL database with 11 tables
- Row-level security
- Real-time subscriptions
- Auto-generated REST API
- Type-safe queries

### Modern Frontend (React + Vite)
- TypeScript for type safety
- Tailwind CSS styling
- Fast hot reload (~200ms)
- 11 fully-built pages
- Responsive design

---

## Features

### For Donors
- Browse technology requests
- Filter by urgency, location, cause
- Secure payment processing
- Track donation impact
- Beautiful dashboard

### For Organizations (CBOs)
- Create equipment requests
- Track request status
- Manage organization profile
- Dashboard with analytics
- Vetting system

### For Admins
- Approve organizations
- Review requests
- Manage users
- Platform analytics

---

## Configuration

All configuration is centralized in:

### Frontend: `frontend-vite/src/config/index.ts`

```typescript
import { clerkConfig, supabaseConfig, stripeConfig } from '@/config'

// All environment variables in one place
// Validates required variables
// Type-safe configuration
```

### Environment Files

#### `frontend-vite/.env.local`
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_API_URL=http://localhost:4000
```

#### `backend/api/.env`
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

See `.env.example` files for complete configuration.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop
- Clerk account ([clerk.com](https://clerk.com))
- Stripe account ([stripe.com](https://stripe.com))

### Installation

1. **Clone and setup:**
   ```bash
   ./setup-vite.sh
   ```

2. **Get API keys:**
   - Clerk: [dashboard.clerk.com](https://dashboard.clerk.com)
   - Stripe: [dashboard.stripe.com](https://dashboard.stripe.com)

3. **Update `.env` files** with your keys

4. **Start the app:**
   ```bash
   # Terminal 1: Database
   cd backend && docker-compose up -d
   
   # Terminal 2: API
   cd backend/api && npm start
   
   # Terminal 3: Frontend
   cd frontend-vite && npm run dev
   ```

5. **Open http://localhost:3000**

**Detailed instructions:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## Project Stats

- **80+ project files** (excluding dependencies)
- **5,000+ lines of code**
- **26 UI components** (24 shadcn + 2 custom)
- **15+ pages** fully built
- **11 database tables** with full security
- **3 environment files** (documented)
- **Comprehensive documentation**

---

## Security Features

- JWT authentication (Clerk)
- Row-level security (Supabase)
- Role-based access control
- Secure payment processing (Stripe)
- HTTPS enforcement
- Environment variable protection
- CORS configuration
- Input validation

---

## Performance Features

- **Vite** for lightning-fast development
- **Code splitting** for smaller bundles
- **Lazy loading** for faster initial load
- **Database indexes** for fast queries
- **Connection pooling** (Supabase)
- **CDN-ready** static assets

---

## Deployment

### Quick Deploy to Vercel (Recommended - FREE Tier!)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com
# 3. Import your repository
# 4. Configure:
#    - Framework: Vite
#    - Root: frontend-vite
#    - Add environment variables
# 5. Deploy!
```

**Cost:** $0/month (Hobby tier) - Perfect for this project!

### Detailed Guides

- **[docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)** - Complete deployment guide with costs
- **[docs/DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist

### What You Get (FREE)

- Frontend hosting (Vercel Hobby)
- Backend API (Vercel Serverless)
- HTTPS/SSL automatic
- Custom domain support
- 100 GB bandwidth/month
- CI/CD automatic deployments
- Preview deployments for PRs

**Total Cost: $0/month** + transaction fees (Stripe)

See [docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md) for complete pricing breakdown and upgrade options.

---

## Contributing

1. Read [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)
2. Create feature branch
3. Follow coding standards
4. Test thoroughly
5. Submit pull request

---

## Support & Resources

### Documentation
- **Quick Start:** [docs/QUICK_START_VITE.md](./docs/QUICK_START_VITE.md)
- **Setup Guide:** [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)
- **Migration:** [docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)

### External Docs
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Clerk](https://clerk.com/docs)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Get Help
- **Issues:** Create GitHub issue
- **Email:** info@kcdigitaldrive.org
- **Community:** Join our Discord

---

## What Makes This Special

- **Modern Stack** - Latest React, Vite, and TypeScript
- **Best-in-Class Auth** - Clerk provides excellent UX
- **Payment Ready** - Stripe integration included
- **Fast Development** - Vite's HMR is fast
- **Beautiful UI** - 26 professional components
- **Well Documented** - Comprehensive guides
- **Production Ready** - Secure, tested, and optimized
- **Easy Setup** - Get started in minutes

---

## v2 vs v3

| Feature | v2 (Next.js) | v3 (Vite) |
|---------|--------------|-----------|
| Build Tool | Next.js | Vite |
| Auth | Supabase Auth | Clerk |
| Payments | None | Stripe |
| Routing | App Router | React Router |
| Dev Server | ~3-5s cold start | ~1-2s cold start |
| Hot Reload | ~1-2s | ~200ms |
| Deployment | Vercel (SSR) | Any static host |

**See full comparison:** [docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)

---

**Version**: 3.0.0 (Vite Edition)  
**Status**: Production-Ready  
**Last Updated**: November 17, 2024

