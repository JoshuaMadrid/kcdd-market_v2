/**
 * Request Detail Page
 *
 * Mirrors the campaign detail UX (hero image, title, story, contextual badges,
 * donate CTA) for single-device donation requests — both org requests and
 * individual recipient requests posted through KC DIME Direct.
 */

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { fetchRequestById } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import {
  ArrowLeft,
  MapPin,
  Users,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Package,
} from 'lucide-react'
import { InKindPledgeDialog } from '@/components/requests/InKindPledgeDialog'

// Verified-free Unsplash photos for request hero images, picked by cause area.
// Fall back to the org's cover image if available.
const HERO_BY_CAUSE: Record<string, string> = {
  'ca-digital-access':
    'https://images.unsplash.com/photo-1758270705317-3ef6142d306f?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
  'ca-education':
    'https://images.unsplash.com/photo-1758687126499-9ff30d1c5762?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
  'ca-education-youth':
    'https://images.unsplash.com/photo-1758270705290-62b6294dd044?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
  'ca-employment':
    'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
  'ca-children-families':
    'https://images.unsplash.com/photo-1758687126499-9ff30d1c5762?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
  'ca-mental-health':
    'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
  'ca-housing-homelessness':
    'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
  'ca-senior-services':
    'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
  'ca-refugees-migration':
    'https://images.unsplash.com/photo-1758270705317-3ef6142d306f?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
  'ca-gender-equality':
    'https://images.unsplash.com/photo-1758687126499-9ff30d1c5762?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
  'ca-poverty-hunger':
    'https://images.unsplash.com/photo-1758270705290-62b6294dd044?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1',
}
const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=1600&q=80&auto=format&fit=crop&kcdd_placeholder=1'

function urgencyStyle(urgency: 'low' | 'medium' | 'high'): string {
  if (urgency === 'high') return 'bg-red-100 text-red-700'
  if (urgency === 'medium') return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useUser()
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)
  const [pledgeDialogOpen, setPledgeDialogOpen] = useState(false)

  const loadRequest = useCallback(() => {
    if (!id) return
    setLoading(true)
    fetchRequestById(id)
      .then(setRequest)
      .catch(() => setError('Request not found'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    loadRequest()
  }, [loadRequest])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ea580c]" />
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-[#737373]" />
            <h1 className="text-2xl font-bold">Request not found</h1>
            <p className="mt-2 text-[#737373]">
              This request may have been fulfilled, closed, or removed.
            </p>
            <Link to="/requests">
              <Button className="mt-6 bg-[#ea580c] hover:bg-[#ea580c]/90">Browse open requests</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isDirect = request.organization?.slug === 'kcdd-direct'
  const heroSrc =
    request.organization?.cover_image_url ||
    (request.cause_area_id ? HERO_BY_CAUSE[request.cause_area_id] : null) ||
    DEFAULT_HERO
  const isPlaceholderHero = heroSrc.includes('kcdd_placeholder=1')

  // Phase 8.5 pledge-aware status
  const isOwnPledge =
    request.status === 'claimed' &&
    request.donation_type === 'in_kind' &&
    request.donor_id === user?.id
  const ownPledgeStatus: 'pending' | 'accepted' | null = isOwnPledge
    ? (request.in_kind_pledge?.pledge_status ?? null)
    : null

  // Phase 8 device breakdown check (for pledge button)
  const deviceBreakdown = request.device_type_breakdown ?? {}
  const totalDevices =
    (Number(deviceBreakdown.desktops) || 0) +
    (Number(deviceBreakdown.laptops) || 0) +
    (Number(deviceBreakdown.tablets) || 0) +
    (Number(deviceBreakdown.smartphones) || 0)

  const challengeCategories: any[] = request.challenge_categories?.map((c: any) => c.category) ?? []
  const identityCategories: any[] = request.identity_categories?.map((c: any) => c.category) ?? []

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="container max-w-5xl py-8">
        <Link
          to="/requests"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#737373] hover:text-[#0a0a0a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Link>

        {/* Hero */}
        <div className="relative mb-6 aspect-[16/6] w-full overflow-hidden rounded-xl bg-[#f5f5f5]">
          <img src={heroSrc} alt={request.description} className="h-full w-full object-cover" />
          {isPlaceholderHero && (
            <span className="pointer-events-none absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Placeholder photo
            </span>
          )}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${urgencyStyle(request.urgency)}`}
            >
              {request.urgency} priority
            </span>
            {request.status !== 'open' && (
              <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                {request.status}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Org chip + cause area */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/organizations/${request.organization?.slug || request.organization?.id}`}
                className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 transition-colors hover:border-[#ea580c]"
              >
                {request.organization?.logo_url && !logoError ? (
                  <img
                    src={request.organization.logo_url}
                    alt={request.organization.name}
                    className="h-6 w-6 rounded-full object-cover"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-lg" aria-hidden="true">
                    {request.organization?.logo_emoji || '🎯'}
                  </span>
                )}
                <span className="text-sm font-medium text-[#ea580c]">
                  {isDirect ? 'KC DIME Direct — Individual Recipient' : request.organization?.name}
                </span>
              </Link>
              {request.cause_area?.name && (
                <Badge variant="secondary" className="bg-[#f5f5f5] text-[#525252]">
                  {request.cause_area.name}
                </Badge>
              )}
              <span className="text-xs text-[#737373]">
                Posted {formatRelativeTime(request.created_at)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-[#0a0a0a] md:text-4xl">
              {isDirect ? 'A verified individual needs tech.' : 'A KC partner org needs tech.'}
            </h1>

            {/* Full description */}
            <div
              className="text-base leading-relaxed text-[#404040] [&_strong]:font-semibold [&_strong]:text-[#0a0a0a]"
              dangerouslySetInnerHTML={{ __html: request.description }}
            />

            {/* What this funds */}
            <Card>
              <CardContent className="py-5">
                <h2 className="mb-3 text-lg font-semibold text-[#0a0a0a]">What your gift funds</h2>
                <p className="text-sm leading-relaxed text-[#525252]">
                  {isDirect
                    ? `Your full ${formatCurrency(request.amount)} gift funds this specific device and the 90-day support window that comes with it. KC DIME procures the equipment, wipes and re-images if refurbished, ships or arranges pickup, and follows up at 30 and 90 days. You'll get a thank-you note from the recipient after delivery.`
                    : `Your full ${formatCurrency(request.amount)} gift funds this specific equipment list for ${request.organization?.name}. KC DIME procures the gear, configures it for the program's use case, and delivers to the org. The org reports back with a delivery photo and an outcome update.`}
                </p>
              </CardContent>
            </Card>

            {/* Org mission */}
            {!isDirect && request.organization?.mission && (
              <Card>
                <CardContent className="py-5">
                  <h2 className="mb-2 text-lg font-semibold text-[#0a0a0a]">
                    About {request.organization.name}
                  </h2>
                  <p className="text-sm leading-relaxed text-[#525252]">
                    {request.organization.mission}
                  </p>
                  {request.organization.website && (
                    <a
                      href={request.organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-sm font-medium text-[#ea580c] hover:underline"
                    >
                      Visit website →
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

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
                    <CardTitle className="text-sm font-semibold text-[#737373] uppercase tracking-wide">
                      Devices Requested
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <tbody>
                        {rows.map(([label, count]) => (
                          <tr key={label} className="border-b last:border-b-0">
                            <td className="py-1.5 text-[#525252]">{label}</td>
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
                    <CardTitle className="text-sm font-semibold text-[#737373] uppercase tracking-wide">
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
                        <span className="text-[#737373]">Distribution:</span>
                        <span>
                          {request.distribution_method
                            .map((d: string) => distLabels[d] ?? d)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {freqLabel && (
                      <div className="flex gap-2">
                        <span className="text-[#737373]">Frequency:</span>
                        <span>{freqLabel}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })()}

            {/* Phase 8 — Application Essays */}
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
                    <CardTitle className="text-sm font-semibold text-[#737373] uppercase tracking-wide">
                      Application Essays
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filled.map(([label, value]) => (
                      <details key={label} className="border rounded-md px-3 py-2">
                        <summary className="cursor-pointer text-sm font-medium select-none">
                          {label}
                        </summary>
                        <p className="text-sm text-[#525252] mt-2 whitespace-pre-wrap leading-relaxed">
                          {value}
                        </p>
                      </details>
                    ))}
                  </CardContent>
                </Card>
              )
            })()}

            {/* Challenge categories */}
            {challengeCategories.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-[#737373] uppercase tracking-wide">
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

            {/* Identity categories */}
            {identityCategories.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-[#737373] uppercase tracking-wide">
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

            {/* Verification reassurance */}
            <Card className="border-[#dcfce7] bg-[#f0fdf4]">
              <CardContent className="flex items-start gap-3 py-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#15803d]" />
                <div className="text-sm text-[#166534]">
                  <strong className="font-semibold">Verified by KC DIME.</strong>{' '}
                  {isDirect
                    ? 'This recipient applied through our intake process, completed a need-verification call, and has at least one professional reference (case manager, teacher, employer, or social worker).'
                    : 'This organization is a verified 501(c)(3) on our partner roster. Every funded request includes a delivery photo and an outcome update.'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky donate column */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <Card className="overflow-hidden">
              <CardContent className="space-y-4 py-5">
                <div>
                  <div className="text-3xl font-bold text-[#0a0a0a]">
                    {formatCurrency(request.amount)}
                  </div>
                  <div className="mt-1 text-sm text-[#737373]">
                    Full request amount. Single donor or split — you pick.
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {request.zipcode && (
                    <div className="flex items-center gap-2 text-[#525252]">
                      <MapPin className="h-4 w-4 text-[#737373]" />
                      KC zip {request.zipcode}
                    </div>
                  )}
                  {request.beneficiaries_count != null && request.beneficiaries_count > 0 && (
                    <div className="flex items-center gap-2 text-[#525252]">
                      <Users className="h-4 w-4 text-[#737373]" />
                      {request.beneficiaries_count}{' '}
                      {request.beneficiaries_count === 1 ? 'person served' : 'people served'}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Phase 8.5: pledge-aware CTA */}
                {request.status === 'open' ? (
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate(`/checkout/${request.id}`)}
                      className="w-full bg-[#ea580c] py-6 text-base font-semibold hover:bg-[#ea580c]/90"
                    >
                      Donate {formatCurrency(request.amount)}
                    </Button>
                    {totalDevices > 0 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setPledgeDialogOpen(true)}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Donate Devices
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    {isOwnPledge && ownPledgeStatus === 'pending' ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100/80 text-sm px-3 py-1">
                        Your pledge — awaiting review
                      </Badge>
                    ) : isOwnPledge && ownPledgeStatus === 'accepted' ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100/80 text-sm px-3 py-1">
                        Your pledge — accepted! Coordinating delivery
                      </Badge>
                    ) : (
                      <Button
                        className="w-full bg-[#ea580c] py-6 text-base font-semibold hover:bg-[#ea580c]/90"
                        disabled
                      >
                        No longer accepting donations
                      </Button>
                    )}
                    {request.status === 'denied' && request.denial_reason && (
                      <p className="text-xs text-[#737373] mt-3 text-left">
                        {request.denial_reason}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-center text-xs text-[#737373]">
                  100% tax-deductible · Secure checkout via Stripe
                </p>

                {request.claimed_at && (
                  <p className="text-xs text-[#737373] text-center">
                    Claimed {formatRelativeTime(request.claimed_at)}
                  </p>
                )}
                {request.fulfilled_at && (
                  <p className="text-xs text-[#737373] text-center">
                    Fulfilled {formatRelativeTime(request.fulfilled_at)}
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
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
