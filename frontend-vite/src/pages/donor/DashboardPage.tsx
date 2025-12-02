/**
 * Donor Dashboard Page
 */

import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DonorDashboard() {
  const { user } = useUser()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName || 'Donor'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your donations and see your impact
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Donations</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests Fulfilled</CardTitle>
            <CardDescription>Organizations helped</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact Score</CardTitle>
            <CardDescription>Community impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Your donation history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No donations yet. Start browsing requests to make your first donation!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

