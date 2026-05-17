import { Link } from 'react-router-dom'
import { ShieldCheck, Building2, Package, ScrollText } from 'lucide-react'
import { routes } from '@/config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function AdminDashboard() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Admin Console
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage organizations, requests, and platform activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Vetting
            </CardTitle>
            <CardDescription>
              Review and approve community-based organizations before they can receive donations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to={routes.admin.vetting}>
              <Button className="w-full">Manage Vetting</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Request Moderation
            </CardTitle>
            <CardDescription>
              View all active and historical requests across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to={routes.admin.requests}>
              <Button className="w-full" variant="outline">View Requests</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription>
              Track all status transitions and actions taken on requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to={routes.admin.audit}>
              <Button className="w-full" variant="outline">View Audit Log</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
