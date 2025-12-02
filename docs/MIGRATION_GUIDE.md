# Migration Guide: Next.js to Vite + Clerk + Stripe

This guide explains the differences between the old Next.js setup and the new Vite setup.

## 🔄 What Changed?

| Component | Before (v2) | After (v3) |
|-----------|-------------|------------|
| **Frontend Framework** | Next.js 14 | React 18 + Vite |
| **Authentication** | Supabase Auth | Clerk |
| **Payments** | Not implemented | Stripe |
| **Routing** | Next.js App Router | React Router v6 |
| **API** | Supabase Edge Functions | Express.js |
| **Build Tool** | Next.js | Vite |

## 📁 Directory Structure Comparison

### Before (Next.js)
```
frontend/
├── src/
│   ├── app/                  # App Router pages
│   │   ├── (dashboard)/
│   │   ├── (marketing)/
│   │   └── auth/
│   ├── components/
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── server.ts
│   │       └── middleware.ts
│   └── middleware.ts         # Next.js middleware
└── next.config.js
```

### After (Vite)
```
frontend-vite/
├── src/
│   ├── pages/                # Page components
│   │   ├── donor/
│   │   └── cbo/
│   ├── components/
│   ├── layouts/              # Layout components
│   ├── routes/               # Route config
│   ├── lib/
│   │   ├── supabase.ts       # DB only
│   │   └── stripe.ts         # Payments
│   ├── config/
│   │   └── index.ts          # Centralized config
│   ├── hooks/
│   │   └── useClerkSupabase.ts
│   └── App.tsx
└── vite.config.ts
```

## 🔐 Authentication Changes

### Before: Supabase Auth

```tsx
// pages/login/page.tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
}
```

### After: Clerk

```tsx
// Use Clerk's built-in components
import { SignIn, useUser } from '@clerk/clerk-react'

function LoginPage() {
  return <SignIn />
}

function Dashboard() {
  const { user } = useUser()
  return <div>Welcome {user?.firstName}</div>
}
```

**Benefits:**
- Pre-built UI components
- Social authentication built-in
- User management dashboard
- Better developer experience

## 🗄️ Database Integration

### Before: Supabase Auth + Database

```tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Auth handled by Supabase
await supabase.auth.signIn(...)

// Database queries
await supabase.from('requests').select('*')
```

### After: Clerk (Auth) + Supabase (Database)

```tsx
import { useUser } from '@clerk/clerk-react'
import { supabase } from '@/lib/supabase'
import { useClerkSupabase } from '@/hooks/useClerkSupabase'

function MyComponent() {
  // Sync Clerk with Supabase
  useClerkSupabase()
  
  // Get user from Clerk
  const { user } = useUser()
  
  // Database queries work the same
  const { data } = await supabase.from('requests').select('*')
}
```

**Key Point:** We removed Supabase Auth but kept the database!

## 💳 Payments (New in v3)

### Payment Flow

1. User clicks "Donate"
2. Frontend creates payment intent via API
3. User enters card details (Stripe CardElement)
4. Payment is processed
5. Webhook updates database
6. User sees success page

### Frontend (CheckoutPage.tsx)

```tsx
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'

const stripe = useStripe()
const elements = useElements()

// Create payment intent
const clientSecret = await createPaymentIntent(requestId, amount)

// Confirm payment
await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: elements.getElement(CardElement),
  },
})
```

### Backend (server.js)

```js
// Create payment intent
app.post('/api/payments/create-intent', async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: 'usd',
  })
  res.json({ clientSecret: paymentIntent.client_secret })
})

// Handle webhook
app.post('/api/payments/webhook', async (req, res) => {
  const event = stripe.webhooks.constructEvent(req.body, sig, secret)
  
  if (event.type === 'payment_intent.succeeded') {
    // Update database
  }
})
```

## 🚀 Routing Changes

### Before: Next.js App Router

```
app/
├── page.tsx                    → /
├── about/page.tsx             → /about
├── (dashboard)/
│   └── donor/
│       └── dashboard/page.tsx → /donor/dashboard
└── auth/
    └── login/page.tsx         → /auth/login
```

File-based routing, automatic.

### After: React Router

```tsx
// src/routes/index.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/donor/dashboard" element={
    <ProtectedRoute>
      <DonorDashboard />
    </ProtectedRoute>
  } />
  <Route path="/sign-in" element={<SignIn />} />
</Routes>
```

Explicit route configuration.

## 🔧 Environment Variables

### Before: Next.js

```env
# next.config.js exposes vars with NEXT_PUBLIC_ prefix
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### After: Vite

```env
# Vite exposes vars with VITE_ prefix
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_CLERK_PUBLISHABLE_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=...
```

**Access in code:**
```ts
// Before
process.env.NEXT_PUBLIC_SUPABASE_URL

// After
import.meta.env.VITE_SUPABASE_URL
```

## 🎨 UI Components

**Good news:** No changes needed!

shadcn/ui components work the same in both Next.js and Vite:

```tsx
// Same in both versions
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

<Button>Click me</Button>
<Card>Content</Card>
```

## 📦 Build & Deployment

### Before: Next.js

```bash
npm run build    # Creates .next/ directory
npm start        # Runs production server
```

Deploy to Vercel automatically.

### After: Vite

```bash
npm run build    # Creates dist/ directory
npm run preview  # Preview production build
```

Deploy `dist/` folder to:
- Vercel (static)
- Netlify
- AWS S3 + CloudFront
- Any static host

## ⚡ Performance Comparison

| Metric | Next.js | Vite |
|--------|---------|------|
| **Cold start** | ~3-5s | ~1-2s |
| **Hot reload** | ~1-2s | ~100-200ms |
| **Build time** | ~30-60s | ~10-20s |
| **Bundle size** | Larger | Smaller |

Vite is significantly faster in development!

## 🔄 Migration Checklist

If migrating an existing app:

- [ ] Copy UI components to new `frontend-vite/src/components/ui/`
- [ ] Recreate pages in `frontend-vite/src/pages/`
- [ ] Set up Clerk authentication
- [ ] Configure Stripe payments
- [ ] Update database queries (remove auth, keep DB)
- [ ] Set up JWT template in Clerk for Supabase
- [ ] Configure environment variables
- [ ] Set up backend API for Stripe
- [ ] Test all features
- [ ] Deploy frontend and backend

## 🆘 Common Issues

### Issue: "Clerk JWT not working with Supabase"

**Solution:** Create JWT template named exactly `supabase` in Clerk dashboard.

### Issue: "Can't access environment variables"

**Solution:** Use `VITE_` prefix and access via `import.meta.env`

### Issue: "Page not found after deployment"

**Solution:** Configure your host for SPA routing (redirect all to index.html)

### Issue: "CORS errors with API"

**Solution:** Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`

## 📚 Learning Resources

- [Vite vs Next.js](https://vitejs.dev/guide/comparisons.html)
- [Clerk vs Supabase Auth](https://clerk.com/blog/clerk-vs-supabase)
- [React Router vs Next.js](https://reactrouter.com/)

## 🎯 Why This Stack?

### Vite over Next.js
- **Faster** development experience
- **Simpler** mental model (no SSR complexity)
- **Better** for SPAs
- **Smaller** bundle sizes

### Clerk over Supabase Auth
- **Better** user experience
- **More** authentication methods
- **Easier** to implement
- **Built-in** user management

### Added Stripe
- **Industry standard** for payments
- **Excellent** developer experience
- **Comprehensive** documentation
- **Mature** ecosystem

## 🚀 Next Steps

1. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Run `./setup-vite.sh`
3. Get API keys from Clerk and Stripe
4. Start building!

---

**Questions?** Open an issue or check the documentation links.

