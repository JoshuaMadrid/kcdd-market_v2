/**
 * CBO Profile Page
 * View own organization profile
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Pencil, ExternalLink } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  OrganizationHero,
  OrganizationSidebar,
  OrganizationAboutTab,
  OrganizationCampaignsTab,
  OrganizationUpdatesTab,
  OrganizationTeamTab,
  PostUpdateDialog,
  AddTeamMemberDialog,
} from '@/components/organization'
import {
  fetchOrganizationByUserId,
  fetchOrganizationRequests,
  fetchOrganizationUpdates,
  fetchOrganizationTeamMembers,
} from '@/lib/supabase'
import { routes } from '@/config'
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
}

interface RequestWithCauseArea extends Request {
  cause_area: CauseArea
}

export function CBOProfile() {
  const { user } = useUser()
  const [organization, setOrganization] = useState<OrganizationWithRelations | null>(null)
  const [requests, setRequests] = useState<RequestWithCauseArea[]>([])
  const [updates, setUpdates] = useState<OrganizationUpdate[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const orgData = await fetchOrganizationByUserId(user.id)
        setOrganization(orgData as unknown as OrganizationWithRelations)

        if (orgData) {
          const [requestsData, updatesData, teamData] = await Promise.all([
            fetchOrganizationRequests(orgData.id),
            fetchOrganizationUpdates(orgData.id),
            fetchOrganizationTeamMembers(orgData.id),
          ])

          setRequests(requestsData as unknown as RequestWithCauseArea[])
          setUpdates(updatesData)
          setTeamMembers(teamData)
        }
      } catch (err) {
        console.error('Failed to load organization:', err)
        setError('Failed to load your organization profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  if (isLoading) {
    return (
      <div className="container py-8">
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
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">
          No Organization Found
        </h1>
        <p className="text-[#737373] mb-6">
          {error || "You haven't set up an organization yet."}
        </p>
        <Link to={routes.cbo.setup}>
          <Button className="bg-[#ea580c] hover:bg-[#dc4c06] text-white">
            Set Up Organization
          </Button>
        </Link>
      </div>
    )
  }


  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header Actions */}
      <div className="px-6 pt-7 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">Your Organization Profile</h1>
        <div className="flex items-center gap-3">
          <Link to={routes.organizations.profile(organization.id)}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Public Profile
            </Button>
          </Link>
          <Link to={routes.cbo.profileEdit}>
            <Button size="sm" className="bg-[#ea580c] hover:bg-[#dc4c06] text-white">
              <Pencil className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 pt-4">
        <OrganizationHero
          coverImageUrl={organization.cover_image_url}
          logoUrl={organization.logo_url}
          logoEmoji={organization.logo_emoji ?? undefined}
          name={organization.name}
          isOwner={true}
          onEditClick={() => window.location.href = routes.cbo.profileEdit}
        />
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
                  organization={organization as any}
                />
              </TabsContent>

              <TabsContent value="campaigns" className="mt-0">
                <OrganizationCampaignsTab requests={requests} />
              </TabsContent>

              <TabsContent value="updates" className="mt-0">
                <OrganizationUpdatesTab
                  updates={updates}
                  isOwner
                  onPostUpdate={() => setUpdateDialogOpen(true)}
                />
              </TabsContent>

              <TabsContent value="team" className="mt-0">
                <OrganizationTeamTab
                  teamMembers={teamMembers}
                  isOwner
                  onAddMember={() => setTeamDialogOpen(true)}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Sidebar */}
          <div className="w-[340px] flex-shrink-0 hidden lg:block">
            <OrganizationSidebar
              organization={organization as any}
              causeAreas={organization.cause_areas as any}
              isOwner
            />
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-20" />

      <PostUpdateDialog
        organizationId={organization.id}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        onSuccess={(newUpdate) => setUpdates((prev) => [newUpdate, ...prev])}
      />
      <AddTeamMemberDialog
        organizationId={organization.id}
        currentCount={teamMembers.length}
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        onSuccess={(newMember) => setTeamMembers((prev) => [...prev, newMember])}
      />
    </div>
  )
}
