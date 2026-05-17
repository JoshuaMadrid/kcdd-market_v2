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

type StatusFilter = 'all' | 'open' | 'claimed' | 'fulfilled' | 'denied'

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  open: 'default',
  claimed: 'secondary',
  fulfilled: 'outline',
  denied: 'destructive',
}

export function DonationsPage() {
  const { user } = useUser()
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    if (!user) return
    fetchDonorRequests(user.id)
      .then(setDonations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const filtered =
    filter === 'all' ? donations : donations.filter((d) => d.status === filter)

  const totalDonated = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0)
  const fulfilledTotal = donations
    .filter((d) => d.status === 'fulfilled')
    .reduce((sum, d) => sum + (d.amount ?? 0), 0)

  const filters: StatusFilter[] = ['all', 'claimed', 'fulfilled', 'denied']

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donation History</h1>
          <p className="text-muted-foreground mt-1">All your contributions to Kansas City communities</p>
        </div>
        <Link to={routes.requests}>
          <Button>Browse Requests</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Committed</CardTitle>
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
              Total Fulfilled
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <div className="text-3xl font-bold">{formatCurrency(fulfilledTotal)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>All Donations</CardTitle>
              <CardDescription>{donations.length} total</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? 'default' : 'outline'}
                  onClick={() => setFilter(f)}
                  className="capitalize"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {filter === 'all'
                  ? "You haven't made any donations yet."
                  : `No ${filter} donations.`}
              </p>
              {filter === 'all' && (
                <Link to={routes.requests}>
                  <Button>Browse Requests</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {d.organization?.name ?? 'Unknown Organization'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{d.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.claimed_at
                        ? new Date(d.claimed_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold">{formatCurrency(d.amount)}</span>
                    <Badge variant={statusVariant[d.status] ?? 'secondary'}>{d.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
