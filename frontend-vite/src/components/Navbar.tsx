/**
 * Navigation Bar Component
 */

import { Link } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { routes } from '@/config'
import { Button } from '@/components/ui/button'
import { NotificationsBell } from '@/components/notifications/NotificationsBell'
import { useAuthStore } from '@/stores/authStore'

export function Navbar() {
  const { isSignedIn } = useUser()
  const { userType } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link to={routes.home} className="flex items-center space-x-2">
            <span className="font-bold text-xl">KCDD Market</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              to={routes.requests}
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Browse Requests
            </Link>
            <Link
              to={routes.about}
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link to={routes.donor.dashboard}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              {userType === 'admin' && (
                <Link to={routes.admin.dashboard}>
                  <Button variant="ghost">Admin</Button>
                </Link>
              )}
              <NotificationsBell />
              <UserButton afterSignOutUrl={routes.home} />
            </>
          ) : (
            <>
              <Link to={routes.signIn}>
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to={routes.signUp}>
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

