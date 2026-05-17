import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchAllRequestsAdmin } from '@/lib/supabase'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

const statusColors: Record<string, string> = {
  open: 'default',
  claimed: 'secondary',
  fulfilled: 'outline',
  denied: 'destructive',
}

const urgencyColors: Record<string, string> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
}

export function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAllRequestsAdmin()
      .then((data) => { setRequests(data); setFiltered(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setFiltered(statusFilter === 'all' ? requests : requests.filter((r) => r.status === statusFilter))
  }, [statusFilter, requests])

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request Moderation</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? '' : `${filtered.length} of ${requests.length} requests`}
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3" />
            No requests found.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>Platform-wide view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.map((req) => (
                <div
                  key={req.id}
                  className="flex items-start justify-between gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{req.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
                      <span>{req.organization?.name ?? 'Unknown org'}</span>
                      <span>·</span>
                      <span>{formatCurrency(req.amount)}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(req.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={urgencyColors[req.urgency] as any}>{req.urgency}</Badge>
                    <Badge variant={statusColors[req.status] as any}>{req.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
