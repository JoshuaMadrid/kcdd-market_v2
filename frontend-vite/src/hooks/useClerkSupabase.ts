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
import { useEffect, useState } from 'react'
import { registerClerkTokenGetter, fetchUserProfile, supabase } from '@/lib/supabase'
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

  // needsRoleSelection / dismissRoleSelection: used by App.tsx to show the
  // role selection modal on first sign-in. Merged from main branch — these
  // fields were removed in the feat/taek version but are still required by
  // RoleSelectionModal. Returning false/no-op keeps the existing behaviour
  // (role selection logic lives in RoleSelectionModal itself).
  const [needsRoleSelection] = useState(false)
  const dismissRoleSelection = () => {}

  return {
    isReady: isLoaded,
    userId,
    needsRoleSelection,
    dismissRoleSelection,
  }
}

/**
 * Hook to get the current user's type (donor, cbo, admin)
 * Respects impersonation context when active.
 */
export const useUserType = () => {
  const { userId } = useAuth()
  const [userType, setUserType] = useState<'donor' | 'cbo' | 'admin' | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for impersonation in sessionStorage (avoids circular dependency with context)
  const impersonatedType = (() => {
    try {
      const stored = sessionStorage.getItem('impersonation')
      if (stored) {
        const parsed = JSON.parse(stored) as { userType: 'donor' | 'cbo' | 'admin' }
        return parsed.userType
      }
    } catch {
      // ignore
    }
    return null
  })()

  useEffect(() => {
    // If impersonating, use the impersonated user's type
    if (impersonatedType) {
      setUserType(impersonatedType)
      setLoading(false)
      return
    }

    const fetchUserType = async () => {
      if (!userId) {
        setUserType(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching user type:', error)
          setUserType('donor') // Default to donor
        } else {
          setUserType(data?.user_type || 'donor')
        }
      } catch (err) {
        console.error('Error:', err)
        setUserType('donor')
      } finally {
        setLoading(false)
      }
    }

    fetchUserType()
  }, [userId, impersonatedType])

  return { userType, loading }
}

/**
 * Hook to get the real (non-impersonated) user type.
 * Used by ProtectedAdminRoute to verify actual admin access.
 */
export const useRealUserType = () => {
  const { userId } = useAuth()
  const [userType, setUserType] = useState<'donor' | 'cbo' | 'admin' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserType = async () => {
      if (!userId) {
        setUserType(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching real user type:', error)
          setUserType('donor')
        } else {
          setUserType(data?.user_type || 'donor')
        }
      } catch (err) {
        console.error('Error:', err)
        setUserType('donor')
      } finally {
        setLoading(false)
      }
    }

    fetchUserType()
  }, [userId])

  return { userType, loading }
}
