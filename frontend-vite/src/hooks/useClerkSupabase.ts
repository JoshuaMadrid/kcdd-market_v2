/**
 * Clerk + Supabase Integration Hook
 * 
 * This hook syncs Clerk authentication with Supabase.
 * It automatically updates the Supabase client with the Clerk JWT token.
 * 
 * Documentation:
 * - Clerk useAuth: https://clerk.com/docs/references/react/use-auth
 * - Clerk JWT Templates: https://clerk.com/docs/backend-requests/making/jwt-templates
 */

import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { setSupabaseAuth, fetchUserProfile } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export const useClerkSupabase = () => {
  const { getToken, isLoaded, userId } = useAuth()
  const { setUserType, reset } = useAuthStore()

  useEffect(() => {
    const syncAuth = async () => {
      if (!isLoaded) return

      if (userId) {
        try {
          const token = await getToken({ template: 'supabase' })
          await setSupabaseAuth(token)
          // Populate userType in authStore so admin nav link is shown immediately
          const profile: any = await fetchUserProfile(userId).catch(() => null)
          if (profile?.user_type) setUserType(profile.user_type)
        } catch (error) {
          console.error('Error syncing Clerk token with Supabase:', error)
          await setSupabaseAuth(null)
        }
      } else {
        await setSupabaseAuth(null)
        reset()
      }
    }

    syncAuth()
  }, [isLoaded, userId, getToken])

  return {
    isReady: isLoaded,
    userId,
  }
}

