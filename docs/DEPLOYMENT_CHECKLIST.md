# ✅ Deployment Checklist

Use this checklist when deploying to production.

## 📋 Pre-Deployment

### Code & Testing
- [ ] All tests passing locally
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in production build
- [ ] All features tested
- [ ] Accessibility tests pass: `npm run test:a11y`
- [ ] CI/CD checks passing on GitHub

### Documentation
- [ ] README.md updated
- [ ] Environment variables documented
- [ ] Deployment guide reviewed

### Repository
- [ ] All changes committed
- [ ] Pushed to `main` branch
- [ ] No sensitive data in commits
- [ ] `.gitignore` properly configured

---

## 🔑 API Keys & Credentials

### Clerk (Production)
- [ ] Production application created
- [ ] Publishable key ready: `pk_live_xxxxx`
- [ ] Secret key ready: `sk_live_xxxxx`
- [ ] JWT template "supabase" configured
- [ ] Production URLs whitelisted

### Supabase (Production)
- [ ] Project created on Supabase Cloud
- [ ] Database migrations run
- [ ] Production URL ready
- [ ] Anon key ready
- [ ] Service role key ready (keep secret!)
- [ ] RLS policies tested

### Stripe (Production)
- [ ] Account in **Live mode**
- [ ] Publishable key ready: `pk_live_xxxxx`
- [ ] Secret key ready: `sk_live_xxxxx`
- [ ] Webhook endpoint will be added after deployment

---

## 🚀 Deploy Frontend

### Vercel Setup
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported to Vercel

### Configuration
- [ ] Framework: **Vite**
- [ ] Root Directory: `frontend-vite`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### Environment Variables Added
- [ ] `VITE_CLERK_PUBLISHABLE_KEY`
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] `VITE_API_URL` (will update after API deployed)
- [ ] `VITE_APP_NAME`
- [ ] `VITE_APP_URL` (will update after deployment)
- [ ] `VITE_ENVIRONMENT=production`
- [ ] `VITE_ENABLE_PAYMENTS=true`
- [ ] `VITE_ENABLE_REALTIME=true`

### Deploy
- [ ] Click "Deploy"
- [ ] Build successful
- [ ] Copy deployment URL
- [ ] Site accessible at URL
- [ ] No console errors in browser

---

## 🔌 Deploy Backend API

### Vercel Setup
- [ ] New project created for API
- [ ] Repository imported
- [ ] Root Directory: `backend/api`

### Environment Variables Added
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET` (will update after Stripe setup)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ALLOWED_ORIGINS` (frontend URL)
- [ ] `CLERK_SECRET_KEY` (optional)
- [ ] `NODE_ENV=production`

### Deploy
- [ ] Click "Deploy"
- [ ] Build successful
- [ ] Copy API URL
- [ ] Health check works: `https://your-api.vercel.app/health`

### Update Frontend
- [ ] Update `VITE_API_URL` in frontend project
- [ ] Redeploy frontend

---

## 🔧 Post-Deployment Configuration

### Stripe Webhook
- [ ] Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
- [ ] Click "Add endpoint"
- [ ] URL: `https://your-api.vercel.app/api/payments/webhook`
- [ ] Events selected:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `charge.refunded`
- [ ] Webhook created
- [ ] Signing secret copied
- [ ] Secret added to API environment: `STRIPE_WEBHOOK_SECRET`
- [ ] API redeployed

### Clerk Production Settings
- [ ] Production URLs added to allowed origins
- [ ] JWT template verified
- [ ] Sign-in/up pages configured
- [ ] Email/password enabled
- [ ] Social login configured (if needed)

### Supabase Production
- [ ] All tables created
- [ ] RLS policies active
- [ ] Seed data added (if needed)
- [ ] Backup configured

### CORS Configuration
- [ ] API `ALLOWED_ORIGINS` includes frontend URL
- [ ] Preview URLs allowed: `https://your-app-*.vercel.app`
- [ ] Tested from frontend

---

## 🌐 Domain Configuration (Optional)

### Custom Domain
- [ ] Domain purchased
- [ ] Added to Vercel project
- [ ] DNS records configured
- [ ] CNAME points to Vercel
- [ ] SSL certificate issued (automatic)
- [ ] Domain accessible

### Update URLs
- [ ] Update `VITE_APP_URL` to custom domain
- [ ] Update `ALLOWED_ORIGINS` to custom domain
- [ ] Update Clerk allowed origins
- [ ] Update Stripe webhook URL (if changed)
- [ ] Redeploy both projects

---

## ✅ Testing Production

### Frontend Tests
- [ ] Homepage loads
- [ ] Sign up works
- [ ] Sign in works
- [ ] Protected routes work
- [ ] Browse requests page loads
- [ ] No console errors

### Authentication Tests
- [ ] Can create account
- [ ] Can sign in
- [ ] User profile loads
- [ ] Protected routes redirect if not signed in
- [ ] Sign out works

### Payment Tests
- [ ] Can view request details
- [ ] Checkout page loads
- [ ] Test payment succeeds (use test card: 4242 4242 4242 4242)
- [ ] Webhook received
- [ ] Database updated
- [ ] Success page shows

### Database Tests
- [ ] Data loads correctly
- [ ] Can create new records
- [ ] Can update records
- [ ] RLS policies working
- [ ] Real-time updates work (if enabled)

### API Tests
- [ ] Health check: `GET /health`
- [ ] Create payment intent works
- [ ] Webhook receives events
- [ ] Database updates correctly
- [ ] Error handling works

---

## 📊 Monitoring Setup

### Vercel Analytics
- [ ] Enabled in project settings
- [ ] Page views tracking
- [ ] Core Web Vitals visible

### Error Monitoring (Optional)
- [ ] Sentry integrated
- [ ] Error alerts configured
- [ ] Team notifications set up

### Logging
- [ ] Vercel function logs accessible
- [ ] Error logs reviewed
- [ ] No sensitive data in logs

---

## 🔒 Security Checklist

### Environment Variables
- [ ] All secrets in environment variables
- [ ] No secrets in code
- [ ] Service role keys kept secret
- [ ] Webhook secrets configured

### HTTPS/SSL
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] SSL certificate valid
- [ ] No mixed content warnings

### Authentication
- [ ] Production keys used
- [ ] Test keys removed
- [ ] JWT template correct
- [ ] CORS configured properly

### API Security
- [ ] Webhook signature verification working
- [ ] Rate limiting considered (if needed)
- [ ] CORS restricted to frontend domain
- [ ] Service role key not exposed

---

## 📱 Mobile Testing

### Responsive Design
- [ ] Tested on iPhone
- [ ] Tested on Android
- [ ] Tested on tablet
- [ ] All features work on mobile
- [ ] Touch interactions work

### Performance
- [ ] Page load < 3 seconds
- [ ] Images optimized
- [ ] No layout shift
- [ ] Smooth scrolling

---

## 🎯 Launch Checklist

### Final Checks
- [ ] All environment variables set
- [ ] All tests passing
- [ ] No console errors
- [ ] Mobile tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Accessibility checked
- [ ] Performance optimized

### Communication
- [ ] Team notified
- [ ] Documentation updated
- [ ] Rollback plan ready
- [ ] Support team briefed

### Monitoring
- [ ] Analytics working
- [ ] Error tracking active
- [ ] Alerts configured
- [ ] Logs accessible

---

## 🔄 Automatic Deployments

### GitHub Integration
- [ ] Automatic deployments enabled
- [ ] Push to `main` triggers deployment
- [ ] PR previews working
- [ ] CI checks required before deploy

### Branch Protection
- [ ] `main` branch protected
- [ ] Require PR reviews
- [ ] Require status checks
- [ ] No force push allowed

---

## 📈 Post-Launch

### Week 1
- [ ] Monitor error rates daily
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Fix critical bugs

### Week 2
- [ ] Review analytics
- [ ] Optimize slow pages
- [ ] Address user issues
- [ ] Plan improvements

### Month 1
- [ ] Check bandwidth usage
- [ ] Review costs
- [ ] Assess upgrade needs
- [ ] Plan new features

---

## 💰 Cost Monitoring

### Monthly Review
- [ ] Vercel bandwidth usage
- [ ] Clerk active users
- [ ] Supabase database size
- [ ] Stripe transaction volume
- [ ] Total monthly cost

### Optimization
- [ ] Image sizes optimized
- [ ] Unused dependencies removed
- [ ] Bundle size minimized
- [ ] Caching configured

### Upgrade Planning
- [ ] Current tier sufficient?
- [ ] Growth projections
- [ ] Budget approved
- [ ] Upgrade scheduled (if needed)

---

## 🆘 Rollback Plan

### If Issues Occur
- [ ] Previous deployment URL saved
- [ ] Can revert via Vercel dashboard
- [ ] Database backup available
- [ ] Team knows rollback process

### Rollback Steps
1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "..." → Promote to Production
4. Verify site works
5. Investigate issue
6. Fix and redeploy

---

## 📞 Support Contacts

### Services
- **Vercel Support:** https://vercel.com/support
- **Clerk Support:** https://clerk.com/support
- **Supabase Support:** https://supabase.com/support
- **Stripe Support:** https://support.stripe.com

### Documentation
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- [README.md](./README.md)

---

## ✅ Deployment Complete!

Once all items are checked:
- ✅ Frontend live
- ✅ Backend API live
- ✅ Payments working
- ✅ Authentication working
- ✅ Database connected
- ✅ Monitoring active
- ✅ Team notified

**🎉 Your app is production-ready!**

---

**Date Deployed:** _______________  
**Deployed By:** _______________  
**Frontend URL:** _______________  
**API URL:** _______________  
**Version:** _______________

---

**Print this checklist and use it for each deployment!**

