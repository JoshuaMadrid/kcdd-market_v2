/**
 * KCDD Market API Server
 * 
 * Handles Stripe payment intents and webhooks
 * 
 * Documentation:
 * - Express: https://expressjs.com/
 * - Stripe API: https://stripe.com/docs/api
 * - Stripe Webhooks: https://stripe.com/docs/webhooks
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config()

// Initialize Express
const app = express()
const PORT = process.env.PORT || 4000

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

// Initialize Supabase (with service role key for admin access)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// Parse JSON bodies (except for webhook route)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next()
  } else {
    express.json()(req, res, next)
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// ============================================
// PAYMENT ENDPOINTS
// ============================================

/**
 * Create Payment Intent
 * POST /api/payments/create-intent
 * 
 * Body:
 * - requestId: string
 * - amount: number (in cents)
 */
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { requestId, amount } = req.body

    if (!requestId || !amount) {
      return res.status(400).json({ error: 'Missing requestId or amount' })
    }

    // Verify request exists in database
    const { data: request, error: fetchError } = await supabase
      .from('requests')
      .select('*, organization:organizations(*)')
      .eq('id', requestId)
      .single()

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Request not found' })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure integer
      currency: 'usd',
      metadata: {
        requestId,
        organizationId: request.organization_id,
        organizationName: request.organization?.name || 'Unknown',
      },
      description: `Donation for: ${request.description}`,
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * Stripe Webhook Handler
 * POST /api/payments/webhook
 * 
 * Handles Stripe webhook events
 */
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature']
    let event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(event.data.object)
          break

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object)
          break

        case 'charge.refunded':
          await handleChargeRefunded(event.data.object)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      res.json({ received: true })
    } catch (error) {
      console.error('Error handling webhook:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

// ============================================
// WEBHOOK HANDLERS
// ============================================

async function handlePaymentSucceeded(paymentIntent) {
  const { requestId, organizationId } = paymentIntent.metadata

  console.log('Payment succeeded:', {
    paymentIntentId: paymentIntent.id,
    requestId,
    amount: paymentIntent.amount / 100,
  })

  // Update request status in database
  const { error } = await supabase
    .from('requests')
    .update({
      status: 'claimed',
      claimed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) {
    console.error('Error updating request:', error)
  }

  // Create notification for organization
  await supabase.from('request_notifications').insert({
    request_id: requestId,
    notification_type: 'claimed',
    title: 'Donation Received!',
    message: `A donor has claimed your request with a $${(paymentIntent.amount / 100).toFixed(2)} donation.`,
    recipient_id: organizationId,
  })
}

async function handlePaymentFailed(paymentIntent) {
  console.log('Payment failed:', {
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error,
  })

  // Could send notification to donor about failed payment
}

async function handleChargeRefunded(charge) {
  console.log('Charge refunded:', {
    chargeId: charge.id,
    amount: charge.amount_refunded / 100,
  })

  // Handle refund logic here
}

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: err.message || 'Internal server error',
  })
})

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('🚀 KCDD Market API Server')
  console.log(`📡 Server running on http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Connected' : '❌ Not configured'}`)
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL}`)
  console.log('\n📝 Available endpoints:')
  console.log('  GET  /health')
  console.log('  POST /api/payments/create-intent')
  console.log('  POST /api/payments/webhook')
})

