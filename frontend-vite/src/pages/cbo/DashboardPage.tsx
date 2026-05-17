import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '@/config'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchOrganizationRequests } from '@/lib/supabase'
import { useCBOOrganization } from '@/hooks/useCBOOrganization'
import { formatCurrency } from '@/lib/utils'

export function CBODashboard() {
  const { organization: org, loading: orgLoading } = useCBOOrganization()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orgLoading) return
    if (!org) { setLoading(false); return }
    fetchOrganizationRequests(org.id)
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [org?.id, orgLoading])

  const activeCount = requests.filter((r) => r.status === 'open').length
  const claimedCount = requests.filter((r) => r.status === 'claimed').length
  const fulfilledCount = requests.filter((r) => r.status === 'fulfilled').length
  const totalReceived = requests
    .filter((r) => r.status === 'fulfilled' || r.status === 'claimed')
    .reduce((sum, r) => sum + (r.amount ?? 0), 0)

  const recentRequests = [...requests].slice(0, 5)

  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {loading ? 'Dashboard' : org ? `${org.name}` : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-2">Manage your requests and organization profile</p>
        </div>
        <Link to={routes.cbo.newRequest}>
          <Button>Create New Request</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="text-3xl font-bold">{activeCount}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Claimed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="text-3xl font-bold">{claimedCount}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fulfilled
            </CardTitle>
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
              Total Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <div className="text-3xl font-bold">{formatCurrency(totalReceived)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Your latest equipment requests</CardDescription>
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
            ) : recentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No requests yet.{' '}
                <Link to={routes.cbo.newRequest} className="underline">
                  Create your first request
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((req) => (
                  <div key={req.id} className="flex justify-between items-center gap-4">
                    <p className="text-sm truncate flex-1">{req.description}</p>
                    <Badge
                      variant={
                        req.status === 'open'
                          ? 'default'
                          : req.status === 'fulfilled'
                          ? 'outline'
                          : 'secondary'
                      }
                    >
                      {req.status}
                    </Badge>
                  </div>
                ))}
                {requests.length > 5 && (
                  <Link to={routes.cbo.requests}>
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View all {requests.length} requests
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
            <CardDescription>Common tasks for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={routes.cbo.newRequest} className="block">
              <Button variant="outline" className="w-full justify-start">
                + Create New Request
              </Button>
            </Link>
            <Link to={routes.cbo.requests} className="block">
              <Button variant="outline" className="w-full justify-start">
                View All Requests
              </Button>
            </Link>
            <Link to={routes.cbo.profile} className="block">
              <Button variant="outline" className="w-full justify-start">
                View Organization Profile
              </Button>
            </Link>
            <Link to={routes.cbo.profileEdit} className="block">
              <Button variant="outline" className="w-full justify-start">
                Edit Organization Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
