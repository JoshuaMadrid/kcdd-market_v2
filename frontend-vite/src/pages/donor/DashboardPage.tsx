/**
 * Donor Dashboard Page
 */

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Settings } from 'lucide-react'
import { OnboardingModal } from '@/components/OnboardingModal'
import { checkOnboardingStatus } from '@/lib/supabase'

export function DonorDashboard() {
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
          <AlertTitle className="text-amber-800">Complete Your Profile</AlertTitle>
          <AlertDescription className="text-amber-700 flex items-center justify-between">
            <span>
              Please complete your profile setup to get started.
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName || 'Donor'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your donations and see your impact
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Donations</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests Fulfilled</CardTitle>
            <CardDescription>Organizations helped</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact Score</CardTitle>
            <CardDescription>Community impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Your donation history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No donations yet. Start browsing requests to make your first donation!
          </p>
        </CardContent>
      </Card>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={handleOnboardingComplete}
        userType="donor"
      />
    </div>
  )
}

