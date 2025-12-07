/**
 * CBO Dashboard Page
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { routes } from '@/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Settings } from 'lucide-react'
import { OnboardingModal } from '@/components/OnboardingModal'
import { checkOnboardingStatus } from '@/lib/supabase'

export function CBODashboard() {
  const { user, isLoaded } = useUser()
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  // Check onboarding status on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id) return
      
      try {
        const status = await checkOnboardingStatus(user.id)
        setOnboardingComplete(status.onboarding_complete ?? false)
        
        // Auto-show modal if onboarding not complete
        if (!status.onboarding_complete) {
          setShowOnboardingModal(true)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        setOnboardingComplete(false)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    if (isLoaded && user) {
      checkStatus()
    }
  }, [user, isLoaded])

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true)
    setShowOnboardingModal(false)
  }

  return (
    <div className="container py-8">
      {/* Onboarding Warning Banner */}
      {onboardingComplete === false && !isCheckingStatus && (
        <Alert variant="destructive" className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Complete Your Organization Profile</AlertTitle>
          <AlertDescription className="text-amber-700 flex items-center justify-between">
            <span>
              Your organization profile is incomplete. Please complete the setup to start receiving donations.
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowOnboardingModal(true)}
              className="ml-4 border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              <Settings className="size-4 mr-2" />
              Complete Setup
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your requests and organization profile
          </p>
        </div>
        <Link to={routes.cbo.newRequest}>
          <Button disabled={!onboardingComplete}>Create New Request</Button>
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

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={handleOnboardingComplete}
        userType="cbo"
      />
    </div>
  )
}

