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
import { setSupabaseAuth } from '@/lib/supabase'

export const useClerkSupabase = () => {
  const { getToken, isLoaded, userId } = useAuth()

  useEffect(() => {
    const syncAuth = async () => {
      if (!isLoaded) return

      if (userId) {
        try {
          // Get Clerk token with Supabase claims
          // This requires setting up a JWT template in Clerk Dashboard
          const token = await getToken({ template: 'supabase' })
          await setSupabaseAuth(token)
        } catch (error) {
          console.error('Error syncing Clerk token with Supabase:', error)
          await setSupabaseAuth(null)
        }
      } else {
        await setSupabaseAuth(null)
      }
    }

    syncAuth()
  }, [isLoaded, userId, getToken])

  return {
    isReady: isLoaded,
    userId,
  }
}

