/**
 * Create New Request Page
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function NewRequestPage() {
  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create New Request</h1>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>
            Tell us what equipment or technology you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Form fields will go here for creating a new request.
          </p>
          <Button>Submit Request</Button>
        </CardContent>
      </Card>
    </div>
  )
}

