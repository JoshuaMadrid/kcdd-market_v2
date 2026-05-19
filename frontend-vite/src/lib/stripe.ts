/**
 * Stripe Payment Integration
 * 
 * Documentation:
 * - Stripe JS: https://stripe.com/docs/js
 * - Stripe React: https://stripe.com/docs/stripe-js/react
 * - Payment Intents: https://stripe.com/docs/payments/payment-intents
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'
import { stripeConfig, apiConfig } from '@/config'

let stripePromise: Promise<Stripe | null>

/**
 * Get Stripe instance (singleton)
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripeConfig.publishableKey)
  }
  return stripePromise
}

type GetToken = (options?: { template?: string }) => Promise<string | null>

/**
 * Create a payment intent for a request.
 * Amount is read from the DB server-side — never sent from the client.
 * donorId is resolved server-side from the Clerk JWT.
 */
export const createPaymentIntent = async (
  requestId: string,
  getToken: GetToken
): Promise<string> => {
  const token = await getToken({ template: 'supabase' })

  const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.payments.createIntent}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ requestId }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.message || data?.error || `Payment intent failed (HTTP ${response.status})`
    const error = new Error(message) as Error & { code?: string; status?: number }
    if (data?.code) error.code = data.code
    error.status = response.status
    throw error
  }

  return data.clientSecret
}

/**
 * Format amount for Stripe (convert dollars to cents)
 */
export const toStripeAmount = (dollars: number): number => {
  return Math.round(dollars * 100)
}

/**
 * Format amount from Stripe (convert cents to dollars)
 */
export const fromStripeAmount = (cents: number): number => {
  return cents / 100
}

