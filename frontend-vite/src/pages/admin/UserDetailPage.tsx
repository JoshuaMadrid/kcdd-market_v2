import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Shield, User, Mail, Calendar, Hash } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { USER_TYPE_LABELS, ORG_TIER_LABELS, VERIFICATION_STATUS_LABELS } from '@/constants/userTypes'
import type { UserType, OrgTier, VerificationStatus } from '@/constants/userTypes'
import { routes } from '@/config'

interface UserDetail {
  id: string
  user_type: UserType
  is_vetted: boolean
  org_tier: OrgTier
  verification_status: VerificationStatus
  created_at: string
  updated_at: string
  donor_profile?: { display_name: string | null; email: string | null; phone: string | null } | null
  organization?: { id: string; name: string; email: string | null; website: string | null } | null
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select(
          `
          id, user_type, is_vetted, org_tier, verification_status, created_at, updated_at,
          donor_profile:donor_profiles(display_name, email, phone),
          organization:organizations(id, name, email, website)
        `,
        )
        .eq('id', id)
        .maybeSingle()
      if (error) {
        setError(error.message)
      } else if (!data) {
        setError('User not found')
      } else {
        const row = data as any
        setUser({
          ...row,
          donor_profile: Array.isArray(row.donor_profile) ? row.donor_profile[0] ?? null : row.donor_profile,
          organization: Array.isArray(row.organization) ? row.organization[0] ?? null : row.organization,
        })
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(routes.admin.dashboard)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to admin
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[#737373]">{error ?? 'User not found.'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName =
    user.donor_profile?.display_name || user.organization?.name || 'Unknown'
  const email = user.donor_profile?.email || user.organization?.email || null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(routes.admin.dashboard)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to admin dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
              {user.user_type === 'cbo' ? (
                <Building2 className="h-7 w-7 text-gray-600" />
              ) : user.user_type === 'admin' ? (
                <Shield className="h-7 w-7 text-gray-600" />
              ) : (
                <User className="h-7 w-7 text-gray-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">{displayName}</CardTitle>
              {email && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#737373]">
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="font-medium text-[#737373]">Type</p>
              <Badge
                className={
                  user.user_type === 'admin'
                    ? 'bg-red-100 text-red-700'
                    : user.user_type === 'cbo'
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-blue-100 text-blue-700'
                }
              >
                {USER_TYPE_LABELS[user.user_type]}
              </Badge>
            </div>
            <div>
              <p className="font-medium text-[#737373]">Tier</p>
              <Badge
                className={
                  user.org_tier === 'large_org'
                    ? 'bg-purple-100 text-purple-700'
                    : user.org_tier === 'small_org'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                }
              >
                {ORG_TIER_LABELS[user.org_tier]}
              </Badge>
            </div>
            <div>
              <p className="font-medium text-[#737373]">Verification</p>
              <Badge
                className={
                  user.verification_status === 'verified'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }
              >
                {VERIFICATION_STATUS_LABELS[user.verification_status]}
              </Badge>
            </div>
            <div>
              <p className="font-medium text-[#737373]">Vetted</p>
              <p>{user.is_vetted ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 font-medium text-[#737373]">
                <Calendar className="h-3.5 w-3.5" />
                Joined
              </p>
              <p>{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 font-medium text-[#737373]">
                <Calendar className="h-3.5 w-3.5" />
                Updated
              </p>
              <p>{new Date(user.updated_at).toLocaleDateString()}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-[#737373]">
              <Hash className="h-3.5 w-3.5" />
              User ID
            </p>
            <p className="mt-1 break-all font-mono text-xs text-[#525252]">{user.id}</p>
          </div>

          {user.organization && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-[#737373]">Organization</p>
                <Link
                  to={routes.organizations.profile(user.organization.id)}
                  className="mt-1 inline-block text-sm font-medium text-[#1b5858] hover:underline"
                >
                  {user.organization.name} →
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
