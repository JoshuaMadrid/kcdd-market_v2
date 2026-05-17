import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { routes } from '@/config'

export function PaymentCancelPage() {
  return (
    <div className="container py-16 max-w-lg text-center">
      <Card>
        <CardHeader>
          <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <CardTitle>Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment was not processed. No charges were made.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to={routes.requests}>
              <Button>Browse Requests</Button>
            </Link>
            <Link to={routes.donor.dashboard}>
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
