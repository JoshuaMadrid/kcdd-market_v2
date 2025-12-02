# 🚀 Vercel Deployment Guide

Complete guide to deploying KCDD Market v3 to Vercel affordably.

## 💰 Cost Breakdown (Updated 2024)

### Vercel Pricing

| Tier | Cost | What You Get |
|------|------|--------------|
| **Hobby (FREE)** | $0/month | ✅ Perfect for this project! |
| Pro | $20/month/user | For commercial projects |
| Enterprise | Custom | Large scale |

### ✅ Hobby Tier (FREE) - Recommended

**Includes:**
- ✅ Unlimited deployments
- ✅ HTTPS/SSL included
- ✅ 100 GB bandwidth/month
- ✅ Serverless Functions (12 seconds timeout)
- ✅ Edge Network (CDN)
- ✅ Automatic Git integration
- ✅ Preview deployments
- ✅ Custom domains (1 free domain per project)

**Limits:**
- ⚠️ 100 GB bandwidth/month (plenty for small-medium projects)
- ⚠️ 12 second serverless function timeout
- ⚠️ Non-commercial use only

**Is Hobby tier enough?**
- ✅ YES for development, testing, MVP
- ✅ YES for non-profit organizations
- ✅ YES for personal projects
- ⚠️ Need Pro for commercial use

**Bandwidth Usage Estimate:**
- Average page: ~500 KB
- 100 GB = ~200,000 page views/month
- More than enough for most projects!

### Other Costs

| Service | Free Tier | Paid | Recommended |
|---------|-----------|------|-------------|
| **Clerk** | 10,000 MAU* | $25/mo for 10K+ | Free tier OK |
| **Supabase** | 500 MB database | $25/mo unlimited | Free tier OK |
| **Stripe** | Free + transaction fees | No monthly fee | Free (pay per transaction) |

*MAU = Monthly Active Users

### 💡 Total Affordable Setup

**Free Tier (Development):**
- Vercel: **$0**
- Clerk: **$0** (up to 10K users)
- Supabase: **$0** (500 MB database)
- Stripe: **$0** + 2.9% + 30¢ per transaction

**Monthly Total: $0 + transaction fees** 🎉

**Upgrade When Needed (Growth):**
- Vercel Pro: $20/month (for commercial)
- Clerk Pro: $25/month (over 10K users)
- Supabase Pro: $25/month (more storage)

**Total: ~$70/month** (only when you need it)

---

## 🚀 Deployment Steps

### Prerequisites

1. **Vercel Account** - [Sign up free](https://vercel.com/signup)
2. **GitHub Account** - Connect your repository
3. **API Keys Ready:**
   - Clerk publishable key
   - Supabase URL & anon key
   - Stripe publishable key

---

## 📱 Frontend Deployment (Main App)

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via GitHub (Recommended)

**Method A: GitHub Integration (Easiest)**

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "feat: ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**

3. **Click "Add New" → "Project"**

4. **Import your GitHub repository**
   - Select: `kcdd-market_v2`

5. **Configure Project:**
   - Framework Preset: **Vite**
   - Root Directory: `frontend-vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. **Add Environment Variables:**

   Click "Environment Variables" and add:

   ```env
   # Clerk
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   
   # Supabase (Production)
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-production-key
   
   # Stripe
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   
   # Backend API (will deploy next)
   VITE_API_URL=https://your-api.vercel.app
   
   # App Config
   VITE_APP_NAME=KC Digital Drive Market
   VITE_APP_URL=https://your-app.vercel.app
   VITE_ENVIRONMENT=production
   VITE_ENABLE_PAYMENTS=true
   VITE_ENABLE_REALTIME=true
   VITE_ENABLE_ANALYTICS=false
   ```

7. **Click "Deploy"**

8. **Wait for build** (~1-2 minutes)

9. **Your app is live!** 🎉

   You'll get a URL like: `https://kcdd-market-v2.vercel.app`

**Method B: CLI Deployment**

```bash
cd frontend-vite
vercel

# Follow prompts:
# - Link to existing project? (N for new)
# - Project name: kcdd-market-v3
# - Directory: ./
# - Override settings? N

# Add environment variables
vercel env add VITE_CLERK_PUBLISHABLE_KEY
vercel env add VITE_SUPABASE_URL
# ... etc

# Deploy to production
vercel --prod
```

---

## 🔌 Backend API Deployment

### Option 1: Deploy to Vercel (Recommended)

**Note:** Vercel serverless functions have 12-second timeout on Hobby tier.
This is fine for quick API calls (payment intents, webhooks).

1. **Go to [vercel.com](https://vercel.com)**

2. **Click "Add New" → "Project"**

3. **Import your GitHub repository again**

4. **Configure Project:**
   - Framework Preset: **Other**
   - Root Directory: `backend/api`
   - Build Command: *(leave empty)*
   - Output Directory: *(leave empty)*

5. **Add Environment Variables:**

   ```env
   # Stripe
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   
   # Supabase (Production)
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # CORS
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   
   # Clerk (optional)
   CLERK_SECRET_KEY=sk_live_xxxxx
   
   # Node
   NODE_ENV=production
   ```

6. **Click "Deploy"**

7. **Copy API URL** (e.g., `https://kcdd-market-api.vercel.app`)

8. **Update frontend environment:**
   - Go back to frontend project settings
   - Update `VITE_API_URL` to your new API URL
   - Redeploy frontend

### Option 2: Railway (Alternative - More Generous)

**Cost:** $5/month for 500 hours execution time

If Vercel timeouts are an issue:

1. **Sign up:** [railway.app](https://railway.app)
2. **Connect GitHub**
3. **New Project** → **Deploy from GitHub**
4. **Select** `backend/api` directory
5. **Add environment variables** (same as above)
6. **Deploy**

Railway gives you:
- No timeout limits
- $5/month flat rate
- More suitable for long-running processes

---

## 🔒 Production Setup

### 1. Update Stripe Webhook

**For Vercel API:**

1. Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://your-api.vercel.app/api/payments/webhook`
4. **Events to listen to:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. **Reveal** signing secret
6. **Copy** and add to Vercel environment as `STRIPE_WEBHOOK_SECRET`
7. **Redeploy** API

### 2. Update Clerk JWT Template

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Navigate to **JWT Templates**
3. Select your **"supabase"** template
4. Update any URLs if needed
5. Save

### 3. Update Supabase (Production)

**Option A: Keep Local Docker (Free)**
- Expose via ngrok or similar
- Not recommended for production

**Option B: Supabase Cloud (Recommended)**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for provisioning (~2 minutes)
4. **Settings → API:**
   - Copy Project URL
   - Copy anon key
   - Copy service role key
5. **SQL Editor:**
   - Run your migration files from `backend/supabase/migrations/`
6. **Update Vercel environment variables** with production keys
7. **Redeploy** both frontend and API

### 4. Update CORS

**In your API deployment:**

Update `ALLOWED_ORIGINS` to include:
```
https://your-frontend.vercel.app,https://your-frontend-preview-*.vercel.app
```

This allows your production domain and preview deployments.

---

## 🌐 Custom Domain (Optional)

### Free Option: Vercel Domain

Every project gets: `project-name.vercel.app`

### Custom Domain (Recommended)

1. **Buy domain:** (GoDaddy, Namecheap, Google Domains)
   - Cost: ~$12/year

2. **Add to Vercel:**
   - Project Settings → Domains
   - Add your domain: `kcdigitaldrive.org`
   - Follow DNS instructions
   - Add CNAME record
   - Wait for DNS propagation (~5-60 minutes)

3. **SSL Certificate:**
   - Automatic via Let's Encrypt (free)
   - Handled by Vercel

---

## 🔄 Automatic Deployments

### Production Deployment

**Every push to `main` triggers:**
1. GitHub Actions CI checks
2. If checks pass → Vercel automatically deploys
3. Your site updates in ~2 minutes

### Preview Deployments (Free!)

**Every pull request gets:**
- Unique preview URL
- Full app with test environment
- Perfect for testing before merge

**Example:**
```
PR #42: https://kcdd-market-v2-git-feat-new-feature-yourteam.vercel.app
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Free on Hobby)

1. **Enable in project settings**
2. **Tracks:**
   - Page views
   - Load times
   - Core Web Vitals
   - Traffic sources

### Vercel Logs (Free)

1. **Project → Deployments → [deployment] → Logs**
2. **See:**
   - Build logs
   - Runtime logs
   - Error messages

### Add Monitoring (Optional)

**Free Options:**
- **Sentry:** Error tracking (free tier)
- **LogRocket:** Session replay (free tier)
- **Google Analytics:** Web analytics (free)

---

## 💡 Cost Optimization Tips

### 1. Use Free Tiers Effectively

```env
# Start with all free tiers
Vercel Hobby: Free
Clerk: Free (10K users)
Supabase: Free (500 MB)
Stripe: Free + transaction fees
```

### 2. Optimize Bundle Size

```bash
# Check bundle size
cd frontend-vite
npm run build

# Analyze
npx vite-bundle-visualizer
```

**Tips:**
- Lazy load routes
- Use dynamic imports
- Optimize images
- Tree-shake unused code

### 3. Optimize Images

```bash
# Install image optimization
npm install sharp

# Use Next Image equivalent
npm install @unpic/react
```

### 4. Cache Static Assets

Already configured in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 5. Monitor Usage

**Vercel Dashboard:**
- Check bandwidth usage
- Monitor function invocations
- Track deployment count

**When to upgrade:**
- Bandwidth > 80 GB/month
- Need commercial license
- Need longer function timeouts
- Need team collaboration

---

## 🎯 Cost Scenarios

### Scenario 1: Small Non-Profit (Recommended)

**Users:** <5,000/month  
**Page views:** <50,000/month

**Costs:**
- Vercel: **$0** (Hobby tier)
- Clerk: **$0** (free tier)
- Supabase: **$0** (free tier)
- Stripe: **2.9% + 30¢ per transaction**

**Monthly Total: $0** + transaction fees

### Scenario 2: Growing Organization

**Users:** 5,000-10,000/month  
**Page views:** 50,000-100,000/month

**Costs:**
- Vercel: **$0** (still within Hobby limits)
- Clerk: **$0** (still under 10K)
- Supabase: **$25** (more storage needed)
- Stripe: Transaction fees

**Monthly Total: $25** + transaction fees

### Scenario 3: Commercial/Large Scale

**Users:** 10,000+/month  
**Page views:** 100,000+/month

**Costs:**
- Vercel Pro: **$20/month**
- Clerk Pro: **$25/month**
- Supabase Pro: **$25/month**
- Stripe: Transaction fees

**Monthly Total: $70** + transaction fees

---

## 🚀 Quick Deploy Checklist

### Before Deploying

- [ ] All environment variables documented
- [ ] Production keys ready (Clerk, Stripe, Supabase)
- [ ] Code pushed to GitHub
- [ ] Tests passing
- [ ] Build works locally (`npm run build`)
- [ ] Supabase production database ready (if using cloud)

### Deploy Frontend

- [ ] Vercel account created
- [ ] Repository imported
- [ ] Environment variables added
- [ ] Custom domain added (optional)
- [ ] Deployment successful
- [ ] Site accessible

### Deploy Backend

- [ ] API project created on Vercel
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] API health check works
- [ ] Frontend updated with API URL

### Post-Deployment

- [ ] Stripe webhook configured
- [ ] Test payment flow
- [ ] Check error logs
- [ ] Monitor analytics
- [ ] Set up alerts (optional)

---

## 📝 Environment Variables Cheat Sheet

### Frontend Production Variables

```env
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

### Backend Production Variables

```env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ALLOWED_ORIGINS=https://your-frontend.vercel.app
CLERK_SECRET_KEY=sk_live_xxxxx
NODE_ENV=production
PORT=3000
```

---

## 🆘 Troubleshooting

### Build Fails

**Error:** `Cannot find module`

```bash
# Check package.json is correct
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

**Issue:** Variables showing as undefined

**Fix:**
1. Ensure variables start with `VITE_` (frontend)
2. Redeploy after adding variables
3. Check variable names match exactly

### API Timeout

**Error:** `Function invocation timeout`

**Solutions:**
1. Optimize slow operations
2. Use Railway instead (no timeout)
3. Upgrade to Vercel Pro (30s timeout)

### CORS Errors

**Error:** `blocked by CORS policy`

**Fix:**
```bash
# Update ALLOWED_ORIGINS in API
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend-*.vercel.app
```

### Stripe Webhook Not Working

**Issue:** Webhook events not received

**Fix:**
1. Check webhook URL is correct
2. Verify signing secret
3. Check Stripe dashboard for delivery attempts
4. View logs in Vercel

---

## 📚 Resources

### Vercel Documentation
- **Getting Started:** https://vercel.com/docs
- **Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables
- **Custom Domains:** https://vercel.com/docs/concepts/projects/custom-domains
- **Pricing:** https://vercel.com/pricing

### Service Documentation
- **Clerk Deployment:** https://clerk.com/docs/deployments/overview
- **Supabase Production:** https://supabase.com/docs/guides/platform/going-into-prod
- **Stripe Production:** https://stripe.com/docs/keys#obtain-api-keys

### Cost Calculators
- **Vercel Pricing:** https://vercel.com/pricing
- **Clerk Pricing:** https://clerk.com/pricing
- **Supabase Pricing:** https://supabase.com/pricing
- **Stripe Pricing:** https://stripe.com/pricing

---

## 🎉 Success!

After following this guide:
- ✅ Frontend deployed to Vercel
- ✅ Backend API deployed
- ✅ Custom domain (optional)
- ✅ HTTPS/SSL automatic
- ✅ CI/CD automatic deployments
- ✅ Preview deployments for PRs
- ✅ Free or affordable tier
- ✅ Monitoring enabled

**Your app is live and production-ready!** 🚀

---

**Need Help?**
- Vercel Discord: https://vercel.com/discord
- Documentation: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- GitHub Issues: Create an issue

---

**Version:** 1.0.0  
**Last Updated:** November 17, 2024  
**Vercel Pricing:** Updated for 2024

