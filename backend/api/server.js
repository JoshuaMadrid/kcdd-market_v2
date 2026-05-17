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
import { clerkAuth } from './middleware/clerkAuth.js'
import requestsRouter from './routes/requests.js'
import usersRouter from './routes/users.js'

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
  process.env.SUPABASE_SECRET_KEY,
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
 * - donorId: string (Clerk user ID)
 *
 * Amount is read from the DB — never trusted from the client.
 */
app.post('/api/payments/create-intent', clerkAuth, async (req, res) => {
  try {
    const { requestId } = req.body
    const donorId = req.auth.userId

    if (!requestId) {
      return res.status(400).json({ error: 'Missing requestId' })
    }

    // Verify request exists and read canonical amount from DB
    const { data: request, error: fetchError } = await supabase
      .from('requests')
      .select('*, organization:organizations(*)')
      .eq('id', requestId)
      .single()

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Request not found' })
    }

    if (request.status !== 'open') {
      return res.status(409).json({ error: 'Request is no longer available' })
    }

    // Create payment intent using the DB amount — never the client-supplied value
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100),
      currency: 'usd',
      metadata: {
        requestId,
        donorId: donorId || '',
        organizationId: request.organization_id,
        organizationUserId: request.organization?.user_id || '',
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
  const { requestId, donorId, organizationId, organizationUserId } = paymentIntent.metadata

  console.log('Payment succeeded:', {
    paymentIntentId: paymentIntent.id,
    requestId,
    donorId,
    amount: paymentIntent.amount / 100,
  })

  // Idempotency: skip if this event was already processed
  const { error: idempotencyError } = await supabase
    .from('stripe_events')
    .insert({
      event_id: paymentIntent.id,
      event_type: 'payment_intent.succeeded',
      payload: paymentIntent,
    })

  if (idempotencyError) {
    console.log('Duplicate event ignored:', paymentIntent.id)
    return
  }

  // Update request: mark claimed, record donor and payment intent
  const { error: updateError } = await supabase
    .from('requests')
    .update({
      status: 'claimed',
      donor_id: donorId || null,
      payment_intent_id: paymentIntent.id,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (updateError) {
    console.error('Error updating request:', updateError)
  }

  // Notify organization — recipient_id must be a user_profiles.id (Clerk user ID)
  await supabase.from('request_notifications').insert({
    request_id: requestId,
    notification_type: 'claimed',
    title: 'Donation Received!',
    message: `A donor has claimed your request with a $${(paymentIntent.amount / 100).toFixed(2)} donation.`,
    recipient_id: organizationUserId || organizationId,
  })
}

async function handlePaymentFailed(paymentIntent) {
  const { requestId, donorId } = paymentIntent.metadata

  console.log('Payment failed:', {
    paymentIntentId: paymentIntent.id,
    requestId,
    error: paymentIntent.last_payment_error?.message,
  })

  if (!donorId) return

  await supabase.from('request_notifications').insert({
    request_id: requestId,
    notification_type: 'denied',
    title: 'Payment Failed',
    message: `Your payment could not be processed. Please try again or use a different card.`,
    recipient_id: donorId,
  })
}

async function handleChargeRefunded(charge) {
  const paymentIntentId = charge.payment_intent

  console.log('Charge refunded:', {
    chargeId: charge.id,
    paymentIntentId,
    amount: charge.amount_refunded / 100,
  })

  if (!paymentIntentId) return

  // Find the request by payment_intent_id (include org's user_id for notification)
  const { data: request } = await supabase
    .from('requests')
    .select('id, organization_id, donor_id, organization:organizations(user_id)')
    .eq('payment_intent_id', paymentIntentId)
    .single()

  if (!request) {
    console.log('No request found for payment intent:', paymentIntentId)
    return
  }

  // Reopen the request
  await supabase
    .from('requests')
    .update({
      status: 'open',
      donor_id: null,
      claimed_at: null,
      payment_intent_id: null,
      refunded_at: new Date().toISOString(),
    })
    .eq('id', request.id)

  // Notify the CBO — recipient_id must be a user_profiles.id (Clerk user ID)
  await supabase.from('request_notifications').insert({
    request_id: request.id,
    notification_type: 'edited',
    title: 'Donation Refunded',
    message: `A donor's payment was refunded. Your request is now open again.`,
    recipient_id: request.organization?.user_id || request.organization_id,
  })
}

// ============================================
// REQUEST LIFECYCLE ENDPOINTS
// ============================================

app.use('/api/requests', clerkAuth, requestsRouter)
app.use('/api/users', clerkAuth, usersRouter)

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

