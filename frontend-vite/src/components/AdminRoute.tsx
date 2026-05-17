import { useEffect, useState } from 'react'
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { ShieldAlert } from 'lucide-react'
import { fetchUserProfile } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Skeleton } from '@/components/ui/skeleton'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const { userType, setUserType } = useAuthStore()
  const [loading, setLoading] = useState(userType === null)

  useEffect(() => {
    if (!user || userType !== null) return
    fetchUserProfile(user.id)
      .then((profile: any) => setUserType(profile?.user_type ?? 'donor'))
      .catch(() => setUserType('donor'))
      .finally(() => setLoading(false))
  }, [user?.id, userType])

  useEffect(() => {
    if (userType !== null) setLoading(false)
  }, [userType])

  if (loading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (userType !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-sm text-muted-foreground">
          This area is restricted to administrators.
        </p>
      </div>
    )
  }

  return <>{children}</>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <AdminGuard>{children}</AdminGuard>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
