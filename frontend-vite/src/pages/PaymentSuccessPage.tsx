/**
 * Payment Success Page
 */

import { Link } from 'react-router-dom'
import { routes } from '@/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function PaymentSuccessPage() {
  return (
    <div className="container py-8 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Thank You for Your Donation!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your donation has been processed successfully. The organization will be notified
            and you'll receive a confirmation email shortly.
          </p>
        </CardContent>
        <CardFooter className="flex gap-4 justify-center">
          <Link to={routes.donor.dashboard}>
            <Button>View Dashboard</Button>
          </Link>
          <Link to={routes.requests}>
            <Button variant="outline">Browse More Requests</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

