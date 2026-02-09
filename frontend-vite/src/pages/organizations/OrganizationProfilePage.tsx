import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  OrganizationHero,
  OrganizationSidebar,
  OrganizationAboutTab,
  OrganizationCampaignsTab,
  OrganizationUpdatesTab,
  OrganizationTeamTab,
} from '@/components/organization'
import {
  fetchOrganization,
  fetchOrganizationRequests,
  fetchOrganizationUpdates,
  fetchOrganizationTeamMembers,
} from '@/lib/supabase'
import type { Database } from '@/types/database'

type Organization = Database['public']['Tables']['organizations']['Row']
type CauseArea = Database['public']['Tables']['cause_areas']['Row']
type IdentityCategory = Database['public']['Tables']['identity_categories']['Row']
type Request = Database['public']['Tables']['requests']['Row']
type OrganizationUpdate = Database['public']['Tables']['organization_updates']['Row']
type TeamMember = Database['public']['Tables']['organization_team_members']['Row']

interface OrganizationWithRelations extends Organization {
  cause_areas?: Array<{ cause_area: CauseArea }>
  populations?: Array<{ category: IdentityCategory }>
  user_profile?: { is_vetted: boolean }
}

interface RequestWithCauseArea extends Request {
  cause_area: CauseArea
}

export function OrganizationProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [organization, setOrganization] = useState<OrganizationWithRelations | null>(null)
  const [requests, setRequests] = useState<RequestWithCauseArea[]>([])
  const [updates, setUpdates] = useState<OrganizationUpdate[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        const [orgData, requestsData, updatesData, teamData] = await Promise.all([
          fetchOrganization(id),
          fetchOrganizationRequests(id),
          fetchOrganizationUpdates(id),
          fetchOrganizationTeamMembers(id),
        ])

        setOrganization(orgData)
        setRequests(requestsData as RequestWithCauseArea[])
        setUpdates(updatesData)
        setTeamMembers(teamData)
      } catch (err) {
        console.error('Failed to load organization:', err)
        setError('Failed to load organization profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <Skeleton className="w-full h-[300px] rounded-[10px] mb-12" />
        <div className="flex gap-8">
          <Skeleton className="flex-1 h-[400px] rounded-[10px]" />
          <Skeleton className="w-[340px] h-[400px] rounded-[10px]" />
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">
          Organization Not Found
        </h1>
        <p className="text-[#737373]">
          {error || "The organization you're looking for doesn't exist."}
        </p>
      </div>
    )
  }

  const openRequestCount = requests.filter((r) => r.status === 'open').length

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Hero Section */}
      <div className="px-6 pt-7">
        <OrganizationHero organization={organization} />
      </div>

      {/* Main Content */}
      <div className="px-6 pt-8">
        <div className="flex gap-8">
          {/* Left: Tabs Content */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="bg-[#f5f5f5] p-[3px] rounded-lg w-full justify-start mb-6">
                <TabsTrigger value="about" className="rounded-md">
                  About
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="rounded-md">
                  Campaigns
                </TabsTrigger>
                <TabsTrigger value="updates" className="rounded-md">
                  Updates
                </TabsTrigger>
                <TabsTrigger value="team" className="rounded-md">
                  Team
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-0">
                <OrganizationAboutTab
                  organization={organization}
                  populations={organization.populations}
                />
              </TabsContent>

              <TabsContent value="campaigns" className="mt-0">
                <OrganizationCampaignsTab requests={requests} />
              </TabsContent>

              <TabsContent value="updates" className="mt-0">
                <OrganizationUpdatesTab updates={updates} />
              </TabsContent>

              <TabsContent value="team" className="mt-0">
                <OrganizationTeamTab teamMembers={teamMembers} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Sidebar */}
          <div className="w-[340px] flex-shrink-0 hidden lg:block">
            <OrganizationSidebar
              organization={organization}
              causeAreas={organization.cause_areas}
              requestCount={openRequestCount}
              isVetted={organization.user_profile?.is_vetted}
            />
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  )
}
