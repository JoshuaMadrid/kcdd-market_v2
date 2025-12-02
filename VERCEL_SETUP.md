# 🚀 Vercel Deployment Setup Guide

**Quick reference guide for deploying KCDD Market to Vercel**

> **Note:** You can set this up whenever you're ready. Everything can be done later!

---

## 📝 Overview

You'll deploy **2 separate projects** to Vercel:
1. **Frontend** (React + Vite app)
2. **Backend API** (Node.js serverless functions)

**Total Time:** ~30 minutes  
**Cost:** FREE (using free tiers)

---

## ✅ Prerequisites Checklist

Before deploying, you'll need accounts and API keys from these services:

### 1. **Vercel Account** 
- [ ] Sign up at: https://vercel.com/signup
- [ ] Connect your GitHub account
- **Cost:** FREE

### 2. **Clerk** (User Authentication)
- [ ] Sign up at: https://clerk.com
- [ ] Create a new application
- [ ] Get your publishable key (starts with `pk_live_` or `pk_test_`)
- [ ] Get your secret key (starts with `sk_live_` or `sk_test_`)
- **Cost:** FREE for up to 10,000 users/month

### 3. **Supabase** (Database)
- [ ] Sign up at: https://supabase.com
- [ ] Create a new project (takes ~2 minutes to provision)
- [ ] Go to Settings → API
- [ ] Copy your Project URL
- [ ] Copy your `anon` (public) key
- [ ] Copy your `service_role` key (KEEP THIS SECRET!)
- **Cost:** FREE for 500MB database

### 4. **Stripe** (Payments)
- [ ] Sign up at: https://stripe.com
- [ ] Go to Developers → API Keys
- [ ] Copy your Publishable key (starts with `pk_test_` or `pk_live_`)
- [ ] Copy your Secret key (starts with `sk_test_` or `sk_live_`)
- [ ] Webhook secret will be created AFTER deployment
- **Cost:** FREE + 2.9% + 30¢ per transaction

---

## 🎯 Step-by-Step Deployment

### **PART 1: Deploy Frontend**

#### 1. Go to Vercel
- Visit: https://vercel.com/new
- Click "Import Project"
- Select your GitHub repository: `kcdd-market_v2`

#### 2. Configure Frontend Project

**Project Settings:**
```
Framework Preset:    Vite
Root Directory:      frontend-vite
Build Command:       npm run build
Output Directory:    dist
```

#### 3. Add Environment Variables

Click "Environment Variables" and add each of these:

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_xxxxx` | Clerk Dashboard → API Keys |
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase → Settings → API → anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_xxxxx` | Stripe → Developers → API Keys |
| `VITE_API_URL` | `https://your-api.vercel.app` | ⚠️ Leave blank for now, add after Part 2 |
| `VITE_APP_NAME` | `KC Digital Drive Market` | Just type this |
| `VITE_APP_URL` | `https://your-app.vercel.app` | Will update after deployment |
| `VITE_ENVIRONMENT` | `production` | Just type this |
| `VITE_ENABLE_PAYMENTS` | `true` | Just type this |
| `VITE_ENABLE_REALTIME` | `true` | Just type this |

#### 4. Deploy Frontend
- Click **"Deploy"**
- Wait ~2 minutes for build to complete
- Copy your deployment URL (e.g., `https://kcdd-market-v2.vercel.app`)
- ✅ Frontend is live!

---

### **PART 2: Deploy Backend API**

#### 1. Create New Vercel Project
- Go to: https://vercel.com/new
- Click "Import Project"
- Select the SAME repository: `kcdd-market_v2`

#### 2. Configure API Project

**Project Settings:**
```
Framework Preset:    Other
Root Directory:      backend/api
Build Command:       (leave empty)
Output Directory:    (leave empty)
```

#### 3. Add Environment Variables

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `STRIPE_SECRET_KEY` | `sk_live_xxxxx` | Stripe → Developers → API Keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxx` | ⚠️ Leave blank for now, add after Part 3 |
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase → Settings → API → service_role key |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Your frontend URL from Part 1 |
| `CLERK_SECRET_KEY` | `sk_live_xxxxx` | Clerk Dashboard → API Keys (optional) |
| `NODE_ENV` | `production` | Just type this |

#### 4. Deploy Backend
- Click **"Deploy"**
- Wait ~1 minute for deployment
- Copy your API URL (e.g., `https://kcdd-market-api.vercel.app`)
- ✅ Backend API is live!

---

### **PART 3: Connect Everything Together**

#### 1. Update Frontend with API URL
- Go to your **frontend project** in Vercel
- Go to Settings → Environment Variables
- Find `VITE_API_URL`
- Update it to your API URL from Part 2
- Go to Deployments → Click "..." on latest → "Redeploy"

#### 2. Setup Stripe Webhook
- Go to: https://dashboard.stripe.com/webhooks
- Click **"Add endpoint"**
- Endpoint URL: `https://your-api.vercel.app/api/payments/webhook`
- Click "Select events" and choose:
  - ✅ `payment_intent.succeeded`
  - ✅ `payment_intent.payment_failed`
  - ✅ `charge.refunded`
- Click "Add endpoint"
- Click "Reveal" on Signing secret
- Copy the webhook secret (starts with `whsec_`)
- Go to your **API project** in Vercel
- Settings → Environment Variables
- Update `STRIPE_WEBHOOK_SECRET` with the webhook secret
- Go to Deployments → Redeploy

#### 3. Setup Supabase Database
- Go to: https://app.supabase.com/project/_/sql
- Open `/backend/supabase/migrations/20240101000000_initial_schema.sql`
- Copy all the SQL code
- Paste into Supabase SQL Editor
- Click "Run"
- ✅ Database tables created!

---

## 🎉 You're Done!

Your app is now live at:
- **Frontend:** `https://your-app.vercel.app`
- **Backend API:** `https://your-api.vercel.app`

---

## ✅ Quick Test Checklist

Test your deployment:
- [ ] Visit your frontend URL
- [ ] Homepage loads correctly
- [ ] Sign up for a new account
- [ ] Browse requests page
- [ ] No console errors in browser (F12 → Console)

---

## 🔧 Common Issues & Fixes

### ❌ Build Failed
**Problem:** "Cannot find module" error  
**Fix:** Make sure Root Directory is set correctly:
- Frontend: `frontend-vite`
- Backend: `backend/api`

### ❌ Environment Variables Not Working
**Problem:** Getting "undefined" errors  
**Fix:** 
1. Make sure all variables start with `VITE_` for frontend
2. After adding variables, click "Redeploy"
3. Check variable names match exactly (case-sensitive)

### ❌ CORS Errors
**Problem:** "blocked by CORS policy"  
**Fix:**
1. Check `ALLOWED_ORIGINS` in API includes your frontend URL
2. No trailing slash on URLs
3. Redeploy API after changing

### ❌ Payments Not Working
**Problem:** Stripe webhook not receiving events  
**Fix:**
1. Verify webhook URL is correct
2. Check webhook signing secret in Vercel
3. View webhook logs in Stripe Dashboard

---

## 💰 Cost Breakdown

**Monthly Costs (Free Tier):**
- Vercel: $0 (Hobby plan)
- Clerk: $0 (up to 10K users)
- Supabase: $0 (500MB storage)
- Stripe: $0 + 2.9% + 30¢ per transaction

**When You Grow:**
- Vercel Pro: $20/month (for commercial use)
- Clerk Pro: $25/month (over 10K users)
- Supabase Pro: $25/month (unlimited storage)

---

## 📚 Additional Resources

- **Full Deployment Guide:** `docs/VERCEL_DEPLOYMENT.md`
- **Complete Checklist:** `docs/DEPLOYMENT_CHECKLIST.md`
- **Setup Guide:** `docs/SETUP_GUIDE.md`
- **Vercel Docs:** https://vercel.com/docs
- **Troubleshooting:** See docs folder

---

## 📝 Environment Variables Quick Reference

### Frontend (.env for Vercel)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_API_URL=https://your-api.vercel.app
VITE_APP_NAME=KC Digital Drive Market
VITE_APP_URL=https://your-app.vercel.app
VITE_ENVIRONMENT=production
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_REALTIME=true
```

### Backend (.env for Vercel)
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ALLOWED_ORIGINS=https://your-frontend.vercel.app
CLERK_SECRET_KEY=sk_live_xxxxx
NODE_ENV=production
```

---

## 🎯 When You're Ready to Deploy

1. **Create all accounts** (Vercel, Clerk, Supabase, Stripe)
2. **Collect all API keys** (use the tables above)
3. **Follow Part 1** (Deploy Frontend)
4. **Follow Part 2** (Deploy Backend)
5. **Follow Part 3** (Connect everything)
6. **Test** using the checklist
7. **🎉 Celebrate!** Your app is live!

---

**Last Updated:** December 2024  
**Questions?** Check the docs folder or create an issue on GitHub.

