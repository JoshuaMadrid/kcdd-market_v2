# 🚀 KCDD Market v3 - Complete Setup Guide

**React + Vite + Clerk + Supabase + Stripe**

This guide will walk you through setting up the complete application from scratch.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Tech Stack Overview](#tech-stack-overview)
3. [Environment Setup](#environment-setup)
4. [Database Setup (Supabase)](#database-setup-supabase)
5. [Authentication Setup (Clerk)](#authentication-setup-clerk)
6. [Payment Setup (Stripe)](#payment-setup-stripe)
7. [Running the Application](#running-the-application)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/) (for local Supabase)
- **Git** - [Download](https://git-scm.com/)

### Required Accounts

Create free accounts on these platforms:

1. **Clerk** - [Sign up](https://clerk.com) - Authentication
2. **Stripe** - [Sign up](https://stripe.com) - Payment processing
3. **Supabase** (optional for production) - [Sign up](https://supabase.com) - Database hosting

---

## Tech Stack Overview

| Technology | Purpose | Documentation |
|-----------|---------|--------------|
| **React 18** | UI Library | [Docs](https://react.dev/) |
| **Vite** | Build Tool | [Docs](https://vitejs.dev/) |
| **TypeScript** | Type Safety | [Docs](https://www.typescriptlang.org/) |
| **Tailwind CSS** | Styling | [Docs](https://tailwindcss.com/) |
| **shadcn/ui** | UI Components | [Docs](https://ui.shadcn.com/) |
| **Clerk** | Authentication | [Docs](https://clerk.com/docs) |
| **Supabase** | Database & Realtime | [Docs](https://supabase.com/docs) |
| **Stripe** | Payments | [Docs](https://stripe.com/docs) |
| **React Router** | Routing | [Docs](https://reactrouter.com/) |
| **Express** | API Server | [Docs](https://expressjs.com/) |

---

## Environment Setup

### Step 1: Clone the Repository

```bash
cd /Users/joshuamadrid/DigitalDrive/kcdd-market_v2
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend-vite
npm install
```

### Step 3: Install Backend API Dependencies

```bash
cd ../backend/api
npm install
```

---

## Database Setup (Supabase)

### Option A: Local Development with Docker (Recommended)

**📚 Documentation:** [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)

1. **Start Supabase with Docker:**

```bash
cd backend
docker-compose up -d
```

2. **Verify it's running:**

- **Database**: http://localhost:54321
- **Studio**: http://localhost:54323
- **Inbucket (Email)**: http://localhost:54324

3. **Get your keys:**

Local development uses default keys:
- **URL**: `http://localhost:54321`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`
- **Service Role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`

### Option B: Supabase Cloud (Production)

**📚 Documentation:** [Supabase Cloud Setup](https://supabase.com/docs/guides/getting-started)

1. Go to [app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Wait for database to provision (~2 minutes)
4. Go to **Settings > API** to get your keys:
   - API URL
   - Anon/Public Key
   - Service Role Key (keep secret!)

### Database Migration

The database schema will be automatically created when you first start the Docker container. The migrations are located in:

```
backend/supabase/migrations/
```

To apply manually:
1. Open Supabase Studio at http://localhost:54323
2. Go to SQL Editor
3. Run the migration files in order

---

## Authentication Setup (Clerk)

**📚 Documentation:** [Clerk Quickstart](https://clerk.com/docs/quickstarts/react)

### Step 1: Create Clerk Application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Click "Add application"
3. Name it "KCDD Market"
4. Enable these sign-in methods:
   - ✅ Email
   - ✅ Google (optional)
   - ✅ Password

### Step 2: Get Your Publishable Key

1. Go to **API Keys** in left sidebar
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)

### Step 3: Configure JWT Template for Supabase

**⚠️ IMPORTANT:** This allows Clerk to work with Supabase

1. Go to **JWT Templates** in Clerk Dashboard
2. Click **"+ New template"**
3. Choose **"Supabase"** from templates
4. Name it: `supabase`
5. The template should include these claims:

```json
{
  "aud": "authenticated",
  "exp": {{current_timestamp.seconds + 3600}},
  "iat": {{current_timestamp.seconds}},
  "iss": "{{issuer}}",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated",
  "user_metadata": {}
}
```

6. Save the template

**📚 Learn more:** [Clerk JWT Templates](https://clerk.com/docs/backend-requests/making/jwt-templates)

### Step 4: Configure Environment Variables

Add to `frontend-vite/.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

---

## Payment Setup (Stripe)

**📚 Documentation:** [Stripe Setup Guide](https://stripe.com/docs/development)

### Step 1: Get Stripe Keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in top right)
3. Go to **Developers > API Keys**
4. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 2: Set Up Webhook

**📚 Documentation:** [Stripe Webhooks](https://stripe.com/docs/webhooks)

For local development, use **Stripe CLI**:

1. **Install Stripe CLI:**

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Or download from https://stripe.com/docs/stripe-cli
```

2. **Login to Stripe:**

```bash
stripe login
```

3. **Forward webhooks to local server:**

```bash
stripe listen --forward-to localhost:4000/api/payments/webhook
```

This will output a webhook signing secret starting with `whsec_`

### Step 3: Configure Environment Variables

Add to `frontend-vite/.env.local`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

Add to `backend/api/.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 4: Test a Payment

Use Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC

**📚 More test cards:** [Stripe Testing](https://stripe.com/docs/testing)

---

## Running the Application

### Step 1: Start Supabase (if using Docker)

```bash
cd backend
docker-compose up -d
```

### Step 2: Start Backend API Server

```bash
cd backend/api
npm start
```

You should see:
```
🚀 KCDD Market API Server
📡 Server running on http://localhost:4000
```

### Step 3: Start Frontend Development Server

```bash
cd frontend-vite
npm run dev
```

You should see:
```
VITE v5.0.12  ready in X ms

➜  Local:   http://localhost:3000/
```

### Step 4: Open in Browser

Visit **http://localhost:3000**

🎉 **Your app is now running!**

---

## Complete Environment Variables Reference

### Frontend (`frontend-vite/.env.local`)

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Supabase Database
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Backend API
VITE_API_URL=http://localhost:4000

# App Configuration
VITE_APP_NAME=KC Digital Drive Market
VITE_APP_URL=http://localhost:3000
VITE_ENVIRONMENT=development
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_REALTIME=true
VITE_ENABLE_ANALYTICS=false
```

### Backend API (`backend/api/.env`)

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Clerk (optional)
CLERK_SECRET_KEY=sk_test_xxxxx
```

---

## Deployment

### Frontend (Vercel)

**📚 Documentation:** [Vercel Deployment](https://vercel.com/docs)

```bash
cd frontend-vite
npm install -g vercel
vercel login
vercel
```

Add environment variables in Vercel Dashboard.

### Backend API (Railway/Render)

**Option 1: Railway** - [Docs](https://docs.railway.app/)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Option 2: Render** - [Docs](https://render.com/docs)

1. Connect your GitHub repository
2. Create a new Web Service
3. Set root directory to `backend/api`
4. Add environment variables

### Database (Supabase Cloud)

Already covered in [Database Setup](#database-setup-supabase)

---

## Troubleshooting

### ❌ "Missing Clerk publishable key"

**Solution:** Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set in `frontend-vite/.env.local`

### ❌ "Failed to fetch requests"

**Solution:** 
1. Ensure Supabase is running: `docker-compose ps`
2. Check Supabase URL in `.env.local`
3. Verify database migrations ran

### ❌ "Stripe payment failed"

**Solution:**
1. Check `STRIPE_SECRET_KEY` in `backend/api/.env`
2. Ensure backend API is running
3. Verify webhook secret is correct
4. Check Stripe Dashboard for errors

### ❌ "CORS error"

**Solution:** Add your frontend URL to `ALLOWED_ORIGINS` in `backend/api/.env`

### ❌ Clerk + Supabase not working

**Solution:**
1. Verify JWT template named exactly `supabase` in Clerk
2. Check template has correct claims
3. Ensure `useClerkSupabase` hook is being called

---

## 📚 Additional Resources

### Official Documentation

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Clerk](https://clerk.com/docs)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Tutorials

- [Clerk + Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
- [Stripe + React](https://stripe.com/docs/stripe-js/react)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

### Community

- [Clerk Discord](https://clerk.com/discord)
- [Supabase Discord](https://discord.supabase.com/)
- [Stripe Discord](https://discord.gg/stripe)

---

## 🎉 Success Checklist

- [ ] Docker containers running
- [ ] Supabase Studio accessible at http://localhost:54323
- [ ] Backend API running on http://localhost:4000
- [ ] Frontend running on http://localhost:3000
- [ ] Can sign up with Clerk
- [ ] Can view requests page
- [ ] Test payment succeeds
- [ ] Webhook receives events

---

**Need help?** Open an issue or contact info@kcdigitaldrive.org

**Version:** 3.0.0  
**Last Updated:** November 17, 2024

