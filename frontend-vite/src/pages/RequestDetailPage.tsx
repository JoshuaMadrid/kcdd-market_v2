import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, ExternalLink, Package } from 'lucide-react'
import { fetchRequestById } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { routes } from '@/config'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { InKindPledgeDialog } from '@/components/requests/InKindPledgeDialog'

const urgencyVariant = (u: string) =>
  u === 'high' ? 'destructive' : u === 'medium' ? 'default' : 'secondary'

const statusVariant = (s: string) => {
  if (s === 'open') return 'default'
  if (s === 'claimed') return 'secondary'
  if (s === 'fulfilled') return 'outline'
  return 'destructive'
}

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <Skeleton className="h-5 w-24" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="grid md:grid-cols-3 gap-6 pt-4">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pledgeDialogOpen, setPledgeDialogOpen] = useState(false)

  const loadRequest = useCallback(() => {
    if (!id) return
    setLoading(true)
    fetchRequestById(id)
      .then(setRequest)
      .catch(() => setError('This request could not be found or is no longer available.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    loadRequest()
  }, [loadRequest])

  if (loading) return <DetailSkeleton />

  if (error || !request) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Request Not Found</h1>
        <p className="text-muted-foreground mb-6">{error ?? 'This request does not exist.'}</p>
        <Link to={routes.requests}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </Link>
      </div>
    )
  }

  const org = request.organization
  const challengeCategories: any[] = request.challenge_categories?.map((c: any) => c.category) ?? []
  const identityCategories: any[] = request.identity_categories?.map((c: any) => c.category) ?? []
  const isOpen = request.status === 'open'

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back nav */}
      <Link
        to={routes.requests}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to requests
      </Link>

      {/* Status + urgency */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant={statusVariant(request.status) as any} className="capitalize">
          {request.status}
        </Badge>
        <Badge variant={urgencyVariant(request.urgency) as any} className="capitalize">
          {request.urgency} urgency
        </Badge>
        {request.urgency === 'high' &&
          request.created_at &&
          Date.now() - new Date(request.created_at).getTime() > 14 * 24 * 60 * 60 * 1000 && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100/80">
              Time-Sensitive
            </Badge>
          )}
        {request.cause_area && (
          <Badge variant="outline">{request.cause_area.name}</Badge>
        )}
      </div>

      {/* Description */}
      <h1 className="text-2xl font-bold leading-snug mb-2">{request.description}</h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
        {request.zipcode && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {request.zipcode}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Posted {formatRelativeTime(request.created_at)}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: categories */}
        <div className="md:col-span-2 space-y-6">
          {/* Phase 8 — Device breakdown */}
          {(() => {
            const b = request.device_type_breakdown
            if (!b) return null
            const rows = (
              [
                ['Desktops', b.desktops],
                ['Laptops', b.laptops],
                ['Tablets', b.tablets],
                ['Smartphones', b.smartphones],
              ] as Array<[string, number | undefined]>
            ).filter(([, n]) => (n ?? 0) > 0)
            if (rows.length === 0) return null
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Devices Requested
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <tbody>
                      {rows.map(([label, count]) => (
                        <tr key={label} className="border-b last:border-b-0">
                          <td className="py-1.5 text-muted-foreground">{label}</td>
                          <td className="py-1.5 text-right font-medium">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )
          })()}

          {/* Phase 8 — Logistics */}
          {(() => {
            const hasAny =
              request.refurbished_ok ||
              request.has_supplier ||
              request.has_it_support ||
              (request.distribution_method && request.distribution_method.length > 0) ||
              request.need_frequency
            if (!hasAny) return null
            const freqLabel =
              request.need_frequency === 'one_time'
                ? 'One-Time'
                : request.need_frequency === 'recurring'
                ? 'Recurring'
                : null
            const distLabels: Record<string, string> = {
              individual: 'Individual Recipients',
              computer_lab: 'Computer Lab',
              shared: 'Shared Device Pool',
            }
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Logistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={request.refurbished_ok ? 'secondary' : 'outline'}>
                      Refurbished OK: {request.refurbished_ok ? 'Yes' : 'No'}
                    </Badge>
                    <Badge variant={request.has_supplier ? 'secondary' : 'outline'}>
                      Has Supplier: {request.has_supplier ? 'Yes' : 'No'}
                    </Badge>
                    <Badge variant={request.has_it_support ? 'secondary' : 'outline'}>
                      Has IT Support: {request.has_it_support ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {request.distribution_method && request.distribution_method.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">Distribution:</span>
                      <span>
                        {request.distribution_method
                          .map((d: string) => distLabels[d] ?? d)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                  {freqLabel && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span>{freqLabel}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })()}

          {/* Phase 8 — Essays */}
          {(() => {
            const essays: Array<[string, string | null]> = [
              ['Technology Gap', request.essay_technology_gap],
              ['Population Impact', request.essay_population_impact],
              ['Prior Support', request.essay_prior_support],
              ['Sustainability', request.essay_sustainability],
              ['IT Capacity', request.essay_it_capacity],
              ['Urgency Narrative', request.essay_urgency_narrative],
            ]
            const filled = essays.filter(([, v]) => v && v.trim().length > 0)
            if (filled.length === 0) return null
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Application Essays
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filled.map(([label, value]) => (
                    <details key={label} className="border rounded-md px-3 py-2">
                      <summary className="cursor-pointer text-sm font-medium select-none">
                        {label}
                      </summary>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">
                        {value}
                      </p>
                    </details>
                  ))}
                </CardContent>
              </Card>
            )
          })()}

          {challengeCategories.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Challenge Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {challengeCategories.map((c) => (
                    <Badge key={c.id} variant="secondary">{c.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {identityCategories.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Communities Served
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {identityCategories.map((c) => (
                    <Badge key={c.id} variant="outline">{c.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Org card */}
          {org && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Requesting Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  {org.logo_emoji && (
                    <span className="text-3xl">{org.logo_emoji}</span>
                  )}
                  <div>
                    <Link
                      to={routes.organizations.profile(org.id)}
                      className="font-semibold hover:underline"
                    >
                      {org.name}
                    </Link>
                    {org.zipcode && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {org.zipcode}
                      </p>
                    )}
                  </div>
                </div>
                {org.mission && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{org.mission}</p>
                )}
                <Separator />
                <div className="flex gap-2">
                  <Link to={routes.organizations.profile(org.id)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Organization
                    </Button>
                  </Link>
                  {org.website && (
                    <a href={org.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: amount + action */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Amount needed</p>
                <p className="text-4xl font-bold">{formatCurrency(request.amount)}</p>
              </div>
              <Separator />
              {isOpen ? (
                <div className="space-y-2">
                  <Link to={routes.checkout(request.id)}>
                    <Button className="w-full" size="lg">Donate Now</Button>
                  </Link>
                  {(() => {
                    const b = request.device_type_breakdown ?? {}
                    const total =
                      (Number(b.desktops) || 0) +
                      (Number(b.laptops) || 0) +
                      (Number(b.tablets) || 0) +
                      (Number(b.smartphones) || 0)
                    if (total === 0) return null
                    return (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() => setPledgeDialogOpen(true)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Donate Devices
                      </Button>
                    )
                  })()}
                </div>
              ) : (
                <div className="text-center">
                  <Badge
                    variant={statusVariant(request.status) as any}
                    className="capitalize text-sm px-3 py-1"
                  >
                    {request.status === 'claimed' ? 'Already claimed' : request.status}
                  </Badge>
                  {request.status === 'denied' && request.denial_reason && (
                    <p className="text-xs text-muted-foreground mt-3 text-left">
                      {request.denial_reason}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {request.claimed_at && (
            <p className="text-xs text-muted-foreground text-center">
              Claimed {formatRelativeTime(request.claimed_at)}
            </p>
          )}
          {request.fulfilled_at && (
            <p className="text-xs text-muted-foreground text-center">
              Fulfilled {formatRelativeTime(request.fulfilled_at)}
            </p>
          )}
        </div>
      </div>

      <InKindPledgeDialog
        request={{ id: request.id, device_type_breakdown: request.device_type_breakdown }}
        open={pledgeDialogOpen}
        onOpenChange={setPledgeDialogOpen}
        onSuccess={loadRequest}
      />
    </div>
  )
}
