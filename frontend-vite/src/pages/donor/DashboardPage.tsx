import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { routes } from '@/config'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchDonorRequests } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

export function DonorDashboard() {
  const { user } = useUser()
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchDonorRequests(user.id)
      .then(setDonations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const totalDonated = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0)
  const fulfilledCount = donations.filter((d) => d.status === 'fulfilled').length
  const impactScore = Math.round(totalDonated / 10)
  const recent = donations.slice(0, 5)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName || 'Donor'}!
        </h1>
        <p className="text-muted-foreground mt-2">Track your donations and see your impact</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Donated
            </CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <div className="text-3xl font-bold">{formatCurrency(totalDonated)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Requests Fulfilled
            </CardTitle>
            <CardDescription>Organizations helped</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="text-3xl font-bold">{fulfilledCount}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Impact Score
            </CardTitle>
            <CardDescription>Community impact</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="text-3xl font-bold">{impactScore}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your latest contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  No donations yet. Start browsing requests!
                </p>
                <Link to={routes.requests}>
                  <Button size="sm">Browse Requests</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((d) => (
                  <div key={d.id} className="flex justify-between items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {d.organization?.name ?? 'Unknown Organization'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{d.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">{formatCurrency(d.amount)}</span>
                      <Badge variant={d.status === 'fulfilled' ? 'outline' : 'secondary'}>
                        {d.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {donations.length > 5 && (
                  <Link to={routes.donor.donations}>
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View all {donations.length} donations
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>What would you like to do?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={routes.requests} className="block">
              <Button variant="outline" className="w-full justify-start">
                Browse Open Requests
              </Button>
            </Link>
            <Link to={routes.donor.donations} className="block">
              <Button variant="outline" className="w-full justify-start">
                View Donation History
              </Button>
            </Link>
            <Link to={routes.donor.profile} className="block">
              <Button variant="outline" className="w-full justify-start">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
