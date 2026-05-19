import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, Package, Filter, X } from 'lucide-react'
import { fetchFilteredRequests, fetchCauseAreas, getActiveCampaigns } from '@/lib/supabase'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InKindPledgeDialog } from '@/components/requests/InKindPledgeDialog'
import { CampaignCard, CampaignCardSkeleton } from '@/components/campaigns/CampaignCard'
import type { CampaignWithOrg } from '@/components/campaigns/CampaignCard'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { routes } from '@/config'

function deviceCount(request: any): number {
  const b = request.device_type_breakdown ?? {}
  return (
    (Number(b.desktops) || 0) +
    (Number(b.laptops) || 0) +
    (Number(b.tablets) || 0) +
    (Number(b.smartphones) || 0)
  )
}

const PAGE_SIZE = 12

const urgencyVariant = (u: string) =>
  u === 'high' ? 'destructive' : u === 'medium' ? 'default' : 'secondary'

// Phase 8.5: donation-type badge for request cards.
// Returns null for fulfilled / denied (status badge alone is enough there).
function donationTypeBadge(request: any): { label: string; className: string } | null {
  const status = request.status
  if (status === 'fulfilled' || status === 'denied') return null

  if (status === 'claimed') {
    if (request.donation_type === 'in_kind') {
      return {
        label: 'Device pledge',
        className: 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-50/80',
      }
    }
    return { label: 'Funded', className: '' } // default secondary
  }

  // status === 'open' — sum device counts to decide
  const b = request.device_type_breakdown ?? {}
  const totalDevices =
    (Number(b.desktops) || 0) +
    (Number(b.laptops) || 0) +
    (Number(b.tablets) || 0) +
    (Number(b.smartphones) || 0)
  if (totalDevices > 0) {
    return {
      label: 'Cash or Devices',
      className: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-50/80',
    }
  }
  return {
    label: 'Cash only',
    className: 'border-green-300 bg-green-50 text-green-700 hover:bg-green-50/80',
  }
}

function RequestCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardContent>
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  )
}

export function RequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive active tab synchronously from URL — no flash on hard refresh
  const activeTab = searchParams.get('tab') === 'campaigns' ? 'campaigns' : 'requests'

  const [requests, setRequests] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [causeAreas, setCauseAreas] = useState<any[]>([])

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [causeAreaIds, setCauseAreaIds] = useState<string[]>([])
  const [showTagFilter, setShowTagFilter] = useState(false)
  const [urgency, setUrgency] = useState('')
  const [page, setPage] = useState(0)
  const [pledgeRequest, setPledgeRequest] = useState<any | null>(null)

  // Campaigns state
  const [campaigns, setCampaigns] = useState<CampaignWithOrg[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const toggleTag = (id: string) => {
    setCauseAreaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setPage(0)
  }

  const clearTags = () => {
    setCauseAreaIds([])
    setPage(0)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // fetchFilteredRequests is 1-based; this component keeps `page` 0-based
      // for UI math (Math.ceil, totalPages-1 bounds, etc.).
      const { requests: data, total: count } = await fetchFilteredRequests({ search, causeAreaIds, urgency, page: page + 1 })
      setRequests(data)
      setTotal(count)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, causeAreaIds, urgency, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    fetchCauseAreas().then(setCauseAreas).catch(console.error)
  }, [])

  // Lazy-load campaigns on first visit to Campaigns tab
  useEffect(() => {
    if (activeTab === 'campaigns' && campaigns.length === 0 && !campaignsLoading) {
      setCampaignsLoading(true)
      getActiveCampaigns(200)
        // Cast via unknown: Supabase codegen emits SelectQueryError for the joined
        // organization relation because the FK isn't in the generated schema.
        // The runtime shape matches CampaignWithOrg — the cast is safe.
        .then((data) => setCampaigns(data as unknown as CampaignWithOrg[]))
        .catch(console.error)
        .finally(() => setCampaignsLoading(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val }, { replace: true })
    setPage(0)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(0)
  }

  const handleUrgency = (val: string) => {
    setUrgency(val === 'all' ? '' : val)
    setPage(0)
  }

  // Client-side filter campaigns by cause area.
  // cause_area_ids is a string[] column on campaigns; if null treat as empty.
  // If causeAreaIds is empty, no filter is applied.
  const filteredCampaigns =
    causeAreaIds.length === 0
      ? campaigns
      : campaigns.filter((c) =>
          causeAreaIds.some((id) => (c.cause_area_ids ?? []).includes(id))
        )

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Technology Requests</h1>
        <p className="text-muted-foreground mt-2">
          Browse active equipment requests from verified Kansas City organizations
        </p>
      </div>

      {/* Filters — cause-area always visible; search + urgency hidden on campaigns tab */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur py-3 mb-6 border-b flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {activeTab === 'requests' && (
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search requests…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary">Search</Button>
            </form>
          )}

          <div className="flex gap-2 shrink-0">
            <Button
              variant="secondary"
              onClick={() => setShowTagFilter((v) => !v)}
              className={showTagFilter ? 'bg-[#1b5858] text-white hover:bg-[#1b5858]/90' : ''}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>

            {activeTab === 'requests' && (
              <Select value={urgency || 'all'} onValueChange={handleUrgency}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All urgency</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Tag palette */}
        {showTagFilter && (
          <div className="flex flex-wrap gap-2 pt-1">
            {causeAreas.map((c) => (
              <Badge
                key={c.id}
                variant="outline"
                className={`cursor-pointer select-none ${
                  causeAreaIds.includes(c.id)
                    ? 'bg-[#1b5858] text-white border-[#1b5858] hover:bg-[#1b5858]/90'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleTag(c.id)}
              >
                {c.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Selected tag chips — shown only when palette is closed */}
        {causeAreaIds.length > 0 && !showTagFilter && (
          <div className="flex flex-wrap items-center gap-2">
            {causeAreaIds.map((id) => {
              const ca = causeAreas.find((c) => c.id === id)
              if (!ca) return null
              return (
                <Badge
                  key={id}
                  className="cursor-pointer bg-[#1b5858] text-white hover:bg-[#1b5858]/90"
                  onClick={() => toggleTag(id)}
                >
                  {ca.name} <X className="ml-1 h-3 w-3" />
                </Badge>
              )
            })}
            <Button variant="ghost" size="sm" onClick={clearTags}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        {/* ── Requests tab ── */}
        <TabsContent value="requests">
          {/* Results count */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-4">
              {total} {total === 1 ? 'request' : 'requests'} found
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <RequestCardSkeleton key={i} />)}
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No requests match your filters.</p>
                <Button
                  variant="ghost"
                  className="mt-3"
                  onClick={() => { setSearch(''); setSearchInput(''); clearTags(); setUrgency(''); setPage(0) }}
                >
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {requests.map((request) => (
                <Card key={request.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-2 text-base">
                          <Link
                            to={routes.requestDetail(request.id)}
                            className="hover:underline"
                          >
                            {request.description}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {request.organization?.id ? (
                            <Link
                              to={routes.organizations.profile(request.organization.id)}
                              className="hover:underline"
                            >
                              {request.organization.name}
                            </Link>
                          ) : (
                            request.organization?.name
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={urgencyVariant(request.urgency) as any}>
                          {request.urgency}
                        </Badge>
                        {request.urgency === 'high' &&
                          request.created_at &&
                          Date.now() - new Date(request.created_at).getTime() > 14 * 24 * 60 * 60 * 1000 && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100/80">
                              Time-Sensitive
                            </Badge>
                          )}
                        {(() => {
                          const dt = donationTypeBadge(request)
                          if (!dt) return null
                          return <Badge className={dt.className}>{dt.label}</Badge>
                        })()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount needed:</span>
                        <span className="font-semibold">{formatCurrency(request.amount)}</span>
                      </div>
                      {request.cause_area && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cause area:</span>
                          <span>{request.cause_area.name}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posted:</span>
                        <span>{formatRelativeTime(request.created_at)}</span>
                      </div>
                      {(() => {
                        const b = request.device_type_breakdown
                        if (!b) return null
                        const parts = [
                          (b.laptops ?? 0) > 0 && `${b.laptops} Laptop${b.laptops !== 1 ? 's' : ''}`,
                          (b.desktops ?? 0) > 0 && `${b.desktops} Desktop${b.desktops !== 1 ? 's' : ''}`,
                          (b.tablets ?? 0) > 0 && `${b.tablets} Tablet${b.tablets !== 1 ? 's' : ''}`,
                          (b.smartphones ?? 0) > 0 && `${b.smartphones} Smartphone${b.smartphones !== 1 ? 's' : ''}`,
                        ].filter(Boolean)
                        if (parts.length === 0) return null
                        return (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Devices:</span>
                            <span className="text-right">{parts.join(', ')}</span>
                          </div>
                        )
                      })()}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Link to={`/checkout/${request.id}`} className="w-full">
                      <Button className="w-full">Donate {formatCurrency(request.amount)}</Button>
                    </Link>
                    {deviceCount(request) > 0 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setPledgeRequest(request)}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Donate Devices
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── Campaigns tab ── */}
        <TabsContent value="campaigns">
          {/* Results count */}
          {!campaignsLoading && (
            <p className="text-sm text-muted-foreground mb-4">
              {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'campaign' : 'campaigns'} found
            </p>
          )}

          {campaignsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <CampaignCardSkeleton key={i} />)}
            </div>
          ) : filteredCampaigns.length === 0 && campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No active campaigns right now.</p>
              </CardContent>
            </Card>
          ) : filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No campaigns match the selected cause area.</p>
                <Button
                  variant="ghost"
                  className="mt-3"
                  onClick={clearTags}
                >
                  Clear filter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} causeAreas={causeAreas} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {pledgeRequest && (
        <InKindPledgeDialog
          request={{ id: pledgeRequest.id, device_type_breakdown: pledgeRequest.device_type_breakdown }}
          open={!!pledgeRequest}
          onOpenChange={(open) => !open && setPledgeRequest(null)}
          onSuccess={() => {
            setPledgeRequest(null)
            load()
          }}
        />
      )}
    </div>
  )
}
