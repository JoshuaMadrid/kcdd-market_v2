/**
 * CBO Setup Page
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CBOSetup() {
  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Organization Setup</h1>

      <Card>
        <CardHeader>
          <CardTitle>Complete Your Organization Profile</CardTitle>
          <CardDescription>
            Fill out your organization details to start receiving donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This form will help us verify your organization and create your profile.
          </p>
          <Button>Start Setup</Button>
        </CardContent>
      </Card>
    </div>
  )
}

