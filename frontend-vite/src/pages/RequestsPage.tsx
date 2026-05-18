/**
 * Browse Campaigns Page
 * Shows active campaigns as cards for donors to browse and support
 * Supports filtering by cause area tags
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveCampaigns, supabase } from '@/lib/supabase'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Search, Target, Users, Loader2, X, Filter } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  slug: string
  creator_name: string
  short_description: string
  funding_goal: number
  amount_raised: number
  supporters_count: number
  image_url: string | null
  logo_url: string | null
  cause_area_ids: string[]
  created_at: string
  organization: {
    id: string
    name: string
    slug: string
    logo_url: string | null
  }
}

interface CauseArea {
  id: string
  name: string
}

interface OpenRequest {
  id: string
  description: string
  amount: number
  urgency: 'low' | 'medium' | 'high'
  zipcode: string | null
  beneficiaries_count: number | null
  created_at: string
  cause_area_id: string | null
  organization: {
    id: string
    name: string
    slug: string | null
    logo_url: string | null
    logo_emoji: string | null
  }
}

export function RequestsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [requests, setRequests] = useState<OpenRequest[]>([])
  const [causeAreas, setCauseAreas] = useState<CauseArea[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTagFilter, setShowTagFilter] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load campaigns, open requests, and cause areas in parallel
        const [campaignsData, requestsData, causeAreasData] = await Promise.all([
          getActiveCampaigns(50),
          supabase
            .from('requests')
            .select(
              `id, description, amount, urgency, zipcode, beneficiaries_count, created_at, cause_area_id,
               organization:organizations(id, name, slug, logo_url, logo_emoji)`
            )
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(50),
          supabase.from('cause_areas').select('id, name').order('name'),
        ])

        setCampaigns(campaignsData || [])
        setRequests((requestsData.data as unknown as OpenRequest[]) || [])
        setCauseAreas(causeAreasData.data || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter requests by search + tags (cause_area_id)
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags =
      selectedTags.length === 0 || (r.cause_area_id ? selectedTags.includes(r.cause_area_id) : false)
    return matchesSearch && matchesTags
  })

  const urgencyStyle = (urgency: 'low' | 'medium' | 'high') => {
    if (urgency === 'high') return 'bg-red-100 text-red-700'
    if (urgency === 'medium') return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
  }

  const getCauseAreaNames = (causeAreaIds: string[]) => {
    return causeAreas
      .filter((ca) => causeAreaIds.includes(ca.id))
      .map((ca) => ca.name)
      .slice(0, 2) // Show max 2 tags
  }

  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const clearTags = () => {
    setSelectedTags([])
  }

  // Filter campaigns by search query AND selected tags
  const filteredCampaigns = campaigns.filter((campaign) => {
    // Search filter
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    // Tag filter - campaign must have ALL selected tags
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tagId) => campaign.cause_area_ids?.includes(tagId))

    return matchesSearch && matchesTags
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ea580c]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#0a0a0a]">
            Browse Campaigns & Requests
          </h1>
          <p className="mt-2 text-lg text-[#737373]">
            Fund a multi-device campaign, or pick a single open request — both go to verified
            Kansas Citians.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#737373]" />
            <Input
              type="search"
              placeholder="Search campaigns, organizations, or causes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 border-[#e5e5e5] bg-white pl-10 text-base"
            />
          </div>
          <Button
            variant={showTagFilter ? 'default' : 'outline'}
            onClick={() => setShowTagFilter(!showTagFilter)}
            className={`h-12 px-4 ${showTagFilter ? 'bg-[#1b5858] hover:bg-[#164444]' : ''}`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter by Cause
            {selectedTags.length > 0 && (
              <Badge className="ml-2 bg-white text-[#1b5858]">{selectedTags.length}</Badge>
            )}
          </Button>
        </div>

        {/* Tag Filter Panel */}
        {showTagFilter && (
          <div className="mb-6 rounded-lg border border-[#e5e5e5] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-[#0a0a0a]">Filter by Cause Area</h3>
              {selectedTags.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearTags} className="text-[#737373]">
                  <X className="mr-1 h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {causeAreas.map((area) => {
                const isSelected = selectedTags.includes(area.id)
                return (
                  <button
                    key={area.id}
                    onClick={() => toggleTag(area.id)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-[#1b5858] text-white'
                        : 'bg-[#f5f5f5] text-[#737373] hover:bg-[#e5e5e5]'
                    }`}
                  >
                    {area.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && !showTagFilter && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#737373]">Filtering by:</span>
            {selectedTags.map((tagId) => {
              const area = causeAreas.find((ca) => ca.id === tagId)
              return area ? (
                <Badge
                  key={tagId}
                  className="cursor-pointer bg-[#1b5858] text-white hover:bg-[#164444]"
                  onClick={() => toggleTag(tagId)}
                >
                  {area.name}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ) : null
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTags}
              className="h-6 px-2 text-[#737373]"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-[#737373]">
          Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} ·{' '}
          {filteredRequests.length} open request{filteredRequests.length !== 1 ? 's' : ''}
        </div>

        {/* Campaigns Grid */}
        <div>
          {filteredCampaigns.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Target className="mx-auto mb-4 h-12 w-12 text-[#737373]" />
                <p className="text-lg text-[#737373]">No active campaigns at this time.</p>
                <p className="mt-1 text-sm text-[#737373]">
                  Check back soon for new opportunities to give.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => (
                <Link key={campaign.id} to={`/campaign/${campaign.slug}`} className="group">
                  <Card className="flex h-full flex-col overflow-hidden border-[#e5e5e5] transition-shadow duration-200 hover:shadow-lg">
                    {/* Campaign Image */}
                    <div className="relative aspect-video overflow-hidden bg-[#f5f5f5]">
                      {campaign.image_url ? (
                        <>
                          <img
                            src={campaign.image_url}
                            alt={campaign.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {campaign.image_url.includes('kcdd_placeholder=1') && (
                            <span className="pointer-events-none absolute right-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                              Placeholder photo
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1b5858] to-[#103032]">
                          {campaign.logo_url ? (
                            <img
                              src={campaign.logo_url}
                              alt={campaign.organization?.name}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                              <span className="text-2xl font-bold text-white">
                                {campaign.organization?.name?.charAt(0) || 'C'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Cause Area Tags */}
                      {campaign.cause_area_ids?.length > 0 && (
                        <div className="absolute bottom-2 left-2 flex gap-1">
                          {getCauseAreaNames(campaign.cause_area_ids).map((name) => (
                            <Badge
                              key={name}
                              variant="secondary"
                              className="bg-white/90 text-xs text-[#0a0a0a]"
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <CardDescription className="font-medium text-[#ea580c]">
                        <Link
                          to={`/organizations/${campaign.organization?.slug || campaign.organization?.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline"
                        >
                          {campaign.organization?.name}
                        </Link>
                      </CardDescription>
                      <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-[#ea580c]">
                        {campaign.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 pb-3">
                      <p className="line-clamp-2 text-sm text-[#737373]">
                        {campaign.short_description}
                      </p>
                    </CardContent>

                    <CardFooter className="flex-col items-stretch gap-3 pt-0">
                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e5e5]">
                          <div
                            className="h-full rounded-full bg-[#ea580c] transition-all duration-500"
                            style={{
                              width: `${calculateProgress(campaign.amount_raised, campaign.funding_goal)}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-[#0a0a0a]">
                            {formatCurrency(campaign.amount_raised)}
                          </span>
                          <span className="text-[#737373]">
                            of {formatCurrency(campaign.funding_goal)}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-[#737373]">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{campaign.supporters_count} supporters</span>
                        </div>
                        <span>{formatRelativeTime(campaign.created_at)}</span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Open Direct Requests */}
        {filteredRequests.length > 0 && (
          <div className="mt-14">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">Open Requests</h2>
                <p className="mt-1 text-sm text-[#737373]">
                  Single-device asks — laptops, hotspots, tablets, monitors — from a partner org or
                  a verified individual through KC DIME Direct.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map((req) => {
                const causeName = causeAreas.find((c) => c.id === req.cause_area_id)?.name
                const isDirect = req.organization?.slug === 'kcdd-direct'
                return (
                  <Link
                    key={req.id}
                    to={`/request/${req.id}`}
                    className="group block rounded-lg border border-[#e5e5e5] bg-white p-4 transition-shadow duration-200 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {req.organization?.logo_url ? (
                          <img
                            src={req.organization.logo_url}
                            alt={req.organization.name}
                            className="h-7 w-7 rounded-full bg-[#f5f5f5] object-cover"
                            onError={(e) => {
                              // Clearbit returns 404 for orgs it doesn't recognize — fall back
                              // to the emoji so we don't render a broken image icon.
                              const img = e.currentTarget
                              const emoji = req.organization?.logo_emoji || '🎯'
                              const fallback = document.createElement('span')
                              fallback.textContent = emoji
                              fallback.className = 'text-lg'
                              img.replaceWith(fallback)
                            }}
                          />
                        ) : (
                          <span className="text-lg">{req.organization?.logo_emoji || '🎯'}</span>
                        )}
                        <span className="text-xs font-medium text-[#ea580c]">
                          {isDirect ? 'Individual recipient' : req.organization?.name}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${urgencyStyle(req.urgency)}`}
                      >
                        {req.urgency}
                      </span>
                    </div>

                    <p
                      className="mb-3 text-sm leading-snug text-[#404040]"
                      dangerouslySetInnerHTML={{ __html: req.description }}
                    />

                    <div className="mb-3 flex flex-wrap gap-1.5 text-[11px] text-[#737373]">
                      {causeName && (
                        <Badge variant="secondary" className="bg-[#f5f5f5] text-[10px] text-[#525252]">
                          {causeName}
                        </Badge>
                      )}
                      {req.zipcode && (
                        <Badge variant="secondary" className="bg-[#f5f5f5] text-[10px] text-[#525252]">
                          {req.zipcode}
                        </Badge>
                      )}
                      {req.beneficiaries_count && req.beneficiaries_count > 0 && (
                        <Badge variant="secondary" className="bg-[#f5f5f5] text-[10px] text-[#525252]">
                          {req.beneficiaries_count}{' '}
                          {req.beneficiaries_count === 1 ? 'recipient' : 'recipients'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-[#f5f5f5] pt-3">
                      <span className="text-lg font-semibold text-[#0a0a0a]">
                        {formatCurrency(req.amount)}
                      </span>
                      <span className="text-xs font-medium text-[#ea580c] group-hover:underline">
                        Fund this request →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
