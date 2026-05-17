/**
 * Checkout Page with Stripe Integration
 * 
 * Documentation:
 * - Stripe Payment Element: https://stripe.com/docs/payments/payment-element
 * - CardElement: https://stripe.com/docs/stripe-js/react#element-components
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createPaymentIntent } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { routes } from '@/config'

export function CheckoutPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useUser()

  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRequest = async () => {
      if (!requestId) return

      try {
        const { data, error } = await supabase
          .from('requests')
          .select('*, organization:organizations(*), cause_area:cause_areas(*)')
          .eq('id', requestId)
          .single()

        if (error) throw error
        setRequest(data)
      } catch (err) {
        console.error('Error loading request:', err)
        setError('Failed to load request')
      } finally {
        setLoading(false)
      }
    }

    loadRequest()
  }, [requestId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !requestId || !request) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Create payment intent — backend reads amount from DB, never from client
      const clientSecret = await createPaymentIntent(requestId, user?.id || '')

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: user?.primaryEmailAddress?.emailAddress,
            },
          },
        }
      )

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Webhook handles DB update — just navigate to success
        navigate(routes.paymentSuccess)
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Request not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Complete Your Donation</h1>

      <div className="grid gap-6">
        {/* Request Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Organization:</span>
              <span className="font-semibold">{request.organization?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Request:</span>
              <span className="font-semibold">{request.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold text-lg">{formatCurrency(request.amount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Enter your card details to complete the donation</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="p-4 border rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </div>
              {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={!stripe || processing}
              >
                {processing ? 'Processing...' : `Donate ${formatCurrency(request.amount)}`}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

