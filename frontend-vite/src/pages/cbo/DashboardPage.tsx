/**
 * CBO Dashboard Page
 */

import { Link } from 'react-router-dom'
import { routes } from '@/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function CBODashboard() {
  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your requests and organization profile
          </p>
        </div>
        <Link to={routes.cbo.newRequest}>
          <Button>Create New Request</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Requests</CardTitle>
            <CardDescription>Currently open</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fulfilled</CardTitle>
            <CardDescription>Completed requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Received</CardTitle>
            <CardDescription>All time donations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>Manage your equipment requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No requests yet. Create your first request to get started!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

