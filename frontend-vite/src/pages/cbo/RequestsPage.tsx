import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { routes } from '@/config'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FulfillDialog } from '@/components/requests/FulfillDialog'
import { DenyDialog } from '@/components/requests/DenyDialog'
import { fetchOrganizationRequests } from '@/lib/supabase'
import { useCBOOrganization } from '@/hooks/useCBOOrganization'
import { formatCurrency } from '@/lib/utils'

const urgencyColors: Record<string, string> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
}

const statusColors: Record<string, string> = {
  open: 'default',
  claimed: 'secondary',
  fulfilled: 'outline',
  denied: 'destructive',
}

export function CBORequests() {
  const { organization: org, loading: orgLoading } = useCBOOrganization()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [fulfillTarget, setFulfillTarget] = useState<string | null>(null)
  const [denyTarget, setDenyTarget] = useState<string | null>(null)

  const loadRequests = async () => {
    if (!org) return
    setLoading(true)
    try {
      const data = await fetchOrganizationRequests(org.id)
      setRequests(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orgLoading) return
    if (!org) { setLoading(false); return }
    loadRequests()
  }, [org?.id, orgLoading])

  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
        <Link to={routes.cbo.newRequest}>
          <Button>Create New Request</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>View and manage your equipment requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={loadRequests} className="mt-4">
                Retry
              </Button>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No requests yet. Create your first request to get started!
              </p>
              <Link to={routes.cbo.newRequest}>
                <Button>Create First Request</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{req.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(req.amount)}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <Badge variant={urgencyColors[req.urgency] as any}>
                      {req.urgency}
                    </Badge>
                    <Badge variant={statusColors[req.status] as any}>
                      {req.status}
                    </Badge>
                    {req.status === 'claimed' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-300 hover:bg-green-50"
                          onClick={() => setFulfillTarget(req.id)}
                        >
                          Fulfill
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={() => setDenyTarget(req.id)}
                        >
                          Deny
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FulfillDialog
        requestId={fulfillTarget ?? ''}
        open={fulfillTarget !== null}
        onOpenChange={(open) => { if (!open) setFulfillTarget(null) }}
        onSuccess={loadRequests}
      />

      <DenyDialog
        requestId={denyTarget ?? ''}
        open={denyTarget !== null}
        onOpenChange={(open) => { if (!open) setDenyTarget(null) }}
        onSuccess={loadRequests}
      />
    </div>
  )
}
