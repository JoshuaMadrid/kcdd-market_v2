import { useState, useEffect } from 'react'
import { ScrollText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchRequestHistory } from '@/lib/supabase'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const statusEmoji: Record<string, string> = {
  open: '📋',
  claimed: '💰',
  fulfilled: '✅',
  denied: '❌',
}

export function AdminAuditPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequestHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground mt-2">
          All request status transitions across the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Status History
          </CardTitle>
          <CardDescription>
            {loading ? '' : `${history.length} entries (most recent first)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 items-start">
                  <Skeleton className="h-6 w-6 rounded-full shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-16 shrink-0" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ScrollText className="h-10 w-10 mx-auto mb-3" />
              No audit entries yet.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <span className="text-base shrink-0 mt-0.5">
                    {statusEmoji[entry.new_status] ?? '🔄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{entry.new_status}</span>
                      {entry.old_status && (
                        <span className="text-muted-foreground"> from {entry.old_status}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Request {entry.request_id}
                      {entry.changed_by_id && ` · by ${entry.changed_by_id}`}
                      {entry.notes && ` · ${entry.notes}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo(entry.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
