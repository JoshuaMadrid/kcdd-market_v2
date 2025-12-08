/**
 * Clerk + Supabase Integration Hook
 * 
 * This hook syncs Clerk authentication with Supabase.
 * It automatically updates the Supabase client with the Clerk JWT token.
 * 
 * NOTE: Clerk-Supabase JWT integration is optional. 
 * If not configured in Clerk Dashboard, we silently continue without it.
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
          // If not configured, we'll just continue without it
          const token = await getToken({ template: 'supabase' })
          await setSupabaseAuth(token)
        } catch {
          // JWT template 'supabase' not configured in Clerk - this is OK
          // We'll use Supabase's anon key for public operations
          // console.log('Clerk-Supabase integration not configured (this is optional)')
        }
      }
    }

    syncAuth()
  }, [isLoaded, userId, getToken])

  return {
    isReady: isLoaded,
    userId,
  }
}

