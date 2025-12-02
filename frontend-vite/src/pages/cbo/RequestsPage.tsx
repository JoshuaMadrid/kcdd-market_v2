/**
 * CBO Requests Management Page
 */

import { Link } from 'react-router-dom'
import { routes } from '@/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function CBORequests() {
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
          <p className="text-sm text-muted-foreground text-center py-8">
            No requests found. Create your first request to get started!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

