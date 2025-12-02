/**
 * Requests Browse Page
 */

import { useEffect, useState } from 'react'
import { fetchOpenRequests } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchOpenRequests()
        setRequests(data || [])
      } catch (error) {
        console.error('Error loading requests:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [])

  if (loading) {
    return (
      <div className="container py-8">
        <p>Loading requests...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Technology Requests</h1>
        <p className="text-muted-foreground mt-2">
          Browse active equipment requests from verified Kansas City organizations
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No open requests at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-2">{request.description}</CardTitle>
                    <CardDescription className="mt-2">
                      {request.organization?.name}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    request.urgency === 'high' ? 'destructive' :
                    request.urgency === 'medium' ? 'default' : 'secondary'
                  }>
                    {request.urgency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount needed:</span>
                    <span className="font-semibold">{formatCurrency(request.amount)}</span>
                  </div>
                  {request.cause_area && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cause area:</span>
                      <span>{request.cause_area.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted:</span>
                    <span>{formatRelativeTime(request.created_at)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/checkout/${request.id}`} className="w-full">
                  <Button className="w-full">Donate Now</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

