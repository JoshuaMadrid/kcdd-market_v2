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
import { registerClerkTokenGetter, fetchUserProfile } from '@/lib/supabase'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

export const useClerkSupabase = () => {
  const { getToken, isLoaded, userId } = useAuth()
  const { setUserType, reset } = useAuthStore()

  useEffect(() => {
    if (!isLoaded) return

    if (userId) {
      // Register a token getter so supabase-js can pull a fresh Clerk JWT
      // before every request. The getter is called per-request, so tokens
      // never go stale (60s lifetime in Clerk dev).
      registerClerkTokenGetter(() => getToken({ template: 'supabase' }))

      const syncAuth = async () => {
        try {
          // Ensure user_profiles row exists for this Clerk user before any
          // downstream FK-bound operations (payment webhooks, become-cbo, etc.)
          await api.post('/api/users/sync', {}, getToken).catch((err) => {
            console.error('Error syncing user_profiles:', err)
          })
          // Populate userType in authStore so admin nav link is shown immediately
          const profile: any = await fetchUserProfile(userId).catch(() => null)
          if (profile?.user_type) setUserType(profile.user_type)
        } catch (error) {
          console.error('Error syncing Clerk session:', error)
        }
      }
      syncAuth()
    } else {
      registerClerkTokenGetter(null)
      reset()
    }
  }, [isLoaded, userId, getToken])

  return {
    isReady: isLoaded,
    userId,
  }
}

