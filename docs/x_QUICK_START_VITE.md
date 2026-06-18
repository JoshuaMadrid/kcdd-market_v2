# ⚡ Quick Start - Vite Edition

Get up and running in 5 minutes!

## Step 1: Run Setup Script

```bash
./setup-vite.sh
```

This installs dependencies and sets up environment files.

## Step 2: Get Your API Keys

### Clerk (2 minutes)

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create an application
3. Copy **Publishable Key**
4. Go to **JWT Templates** → Create **Supabase** template

### Stripe (1 minute)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Switch to **Test mode**
3. Go to **Developers → API Keys**
4. Copy **Publishable key** and **Secret key**

## Step 3: Update Environment Files

### Frontend: `frontend-vite/.env.local`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

### Backend: `backend/api/.env`

```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
```

## Step 4: Start Everything

### Terminal 1: Supabase

```bash
cd backend
docker-compose up -d
```

### Terminal 2: Backend API

```bash
cd backend/api
npm start
```

### Terminal 3: Frontend

```bash
cd frontend-vite
npm run dev
```

## Step 5: Open Browser

Visit **http://localhost:3000**

🎉 **You're done!**

## Test the App

1. **Sign Up:** Click "Sign Up" → Create account
2. **Browse Requests:** View technology requests
3. **Make Test Donation:**
   - Click "Donate Now" on any request
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry and CVC

## 🔗 Quick Links

- **App:** http://localhost:3000
- **Supabase Studio:** http://localhost:54323
- **API Health:** http://localhost:4000/health
- **Email Testing:** http://localhost:54324

## 📚 Full Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete setup instructions.

## 🆘 Troubleshooting

### "Missing Clerk key"
→ Add `VITE_CLERK_PUBLISHABLE_KEY` to `frontend-vite/.env.local`

### "Payment failed"
→ Check `STRIPE_SECRET_KEY` in `backend/api/.env`

### "Can't connect to database"
→ Run `docker-compose up -d` in backend directory

### "Port already in use"
→ Kill process: `lsof -i :3000` then `kill -9 <PID>`

## 🎯 Next Steps

1. Explore the code in `frontend-vite/src/`
2. Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) to understand the changes
3. Check out component documentation at `/components-showcase`

**Happy coding! 🚀**

