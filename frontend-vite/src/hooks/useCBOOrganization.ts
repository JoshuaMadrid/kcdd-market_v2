import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { fetchOrganizationByUserId } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export function useCBOOrganization() {
  const { user } = useUser()
  const { organization, organizationLoaded, setOrganization } = useAuthStore()
  const [loading, setLoading] = useState(!organizationLoaded)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    if (organizationLoaded) {
      setLoading(false)
      return
    }
    fetchOrganizationByUserId(user.id)
      .then((org) => {
        setOrganization(org)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Organization not found')
        setLoading(false)
      })
  }, [user?.id, organizationLoaded])

  return { organization, loading, error }
}
