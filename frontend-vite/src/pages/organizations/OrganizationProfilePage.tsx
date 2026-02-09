/**
 * Organization Profile Page (Public)
 * Route: /organizations/:id
 * Displays full organization profile for donors to view
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  OrganizationHero,
  OrganizationSidebar,
  OrganizationAboutTab,
  OrganizationCampaignsTab,
  OrganizationUpdatesTab,
  OrganizationTeamTab
} from '@/components/organization'
import {
  fetchOrganizationProfile,
  fetchOrganizationRequests,
  fetchOrganizationUpdates,
  fetchOrganizationTeamMembers,
  type OrganizationProfile,
  type OrganizationUpdate,
  type OrganizationTeamMember
} from '@/lib/supabase'

export function OrganizationProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [updates, setUpdates] = useState<OrganizationUpdate[]>([])
  const [teamMembers, setTeamMembers] = useState<OrganizationTeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    if (id) {
      loadOrganizationData()
    }
  }, [id])

  const loadOrganizationData = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel
      const [org, reqs, upds, team] = await Promise.all([
        fetchOrganizationProfile(id),
        fetchOrganizationRequests(id),
        fetchOrganizationUpdates(id),
        fetchOrganizationTeamMembers(id)
      ])

      if (!org) {
        setError('Organization not found')
        return
      }

      setOrganization(org)
      setRequests(reqs)
      setUpdates(upds)
      setTeamMembers(team)
    } catch (err) {
      console.error('Error loading organization:', err)
      setError('Failed to load organization')
    } finally {
      setLoading(false)
    }
  }

  // Calculate request stats
  const requestStats = {
    open: requests.filter(r => r.status === 'open').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
    totalRaised: requests
      .filter(r => r.status === 'fulfilled')
      .reduce((sum, r) => sum + Number(r.amount), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ea580c]" />
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] p-6">
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-4">Organization Not Found</h1>
        <p className="text-[#737373] mb-6">
          The organization you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/requests">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Requests
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Back Link */}
        <Link
          to="/requests"
          className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-[#0a0a0a] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Link>

        {/* Hero Section */}
        <OrganizationHero
          coverImageUrl={organization.cover_image_url}
          logoUrl={organization.logo_url}
          logoEmoji={organization.logo_emoji}
          name={organization.name}
        />

        {/* Header with Name */}
        <div className="mt-16 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#0a0a0a] mb-2">
                {organization.name}
              </h1>
              {organization.tagline && (
                <p className="text-lg text-[#737373]">{organization.tagline}</p>
              )}
            </div>
            {organization.website && (
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#ea580c] hover:underline"
              >
                Visit Website
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Tabs Content (Left) */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-[#f5f5f5] p-[3px] rounded-lg w-full justify-start mb-6">
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="campaigns"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                >
                  Campaigns
                  {requests.length > 0 && (
                    <span className="ml-1.5 text-xs bg-[#171717] text-white px-1.5 py-0.5 rounded-full">
                      {requests.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="updates"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                >
                  Updates
                  {updates.length > 0 && (
                    <span className="ml-1.5 text-xs bg-[#171717] text-white px-1.5 py-0.5 rounded-full">
                      {updates.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="team"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                >
                  Team
                  {teamMembers.length > 0 && (
                    <span className="ml-1.5 text-xs bg-[#171717] text-white px-1.5 py-0.5 rounded-full">
                      {teamMembers.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-0">
                <OrganizationAboutTab organization={organization} />
              </TabsContent>

              <TabsContent value="campaigns" className="mt-0">
                <OrganizationCampaignsTab requests={requests} />
              </TabsContent>

              <TabsContent value="updates" className="mt-0">
                <OrganizationUpdatesTab updates={updates} />
              </TabsContent>

              <TabsContent value="team" className="mt-0">
                <OrganizationTeamTab members={teamMembers} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar (Right) */}
          <OrganizationSidebar
            organization={organization}
            requestStats={requestStats}
          />
        </div>

        {/* Bottom Padding */}
        <div className="h-20" />
      </div>
    </div>
  )
}

export default OrganizationProfilePage
