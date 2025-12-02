/**
 * Donor Profile Page
 */

import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DonorProfile() {
  const { user } = useUser()

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Name</label>
            <p className="text-muted-foreground">{user?.fullName}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

